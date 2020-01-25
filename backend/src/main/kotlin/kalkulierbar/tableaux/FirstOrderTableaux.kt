package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.UnificationImpossible
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.Relation
import kalkulierbar.logic.transform.FirstOrderCNF
import kalkulierbar.logic.transform.Unification
import kalkulierbar.logic.transform.VariableInstantiator
import kalkulierbar.parsers.FirstOrderParser
import kotlinx.serialization.MissingFieldException
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonDecodingException

val serializer = Json(context = FoTermModule)

@Suppress("TooManyFunctions")
class FirstOrderTableaux : GenericTableaux<Relation>, JSONCalculus<FoTableauxState, FoTableauxMove, FoTableauxParam>() {

    override val identifier = "fo-tableaux"

    override fun parseFormulaToState(formula: String, params: FoTableauxParam?): FoTableauxState {
        val clauses = FirstOrderCNF.transform(FirstOrderParser.parse(formula))

        if (params == null)
            return FoTableauxState(clauses, formula)
        else
            return FoTableauxState(clauses, formula, params.type, params.regular, params.backtracking)
    }

    override fun applyMoveOnState(state: FoTableauxState, move: FoTableauxMove): FoTableauxState {
        // Pass expand, close, undo moves to relevant subfunction
        return when (move.type) {
            FoMoveType.AUTOCLOSE -> applyAutoCloseBranch(state, move.id1, move.id2)
            FoMoveType.CLOSE -> applyMoveCloseBranch(state, move.id1, move.id2, move.getVarAssignTerms())
            FoMoveType.EXPAND -> applyMoveExpandLeaf(state, move.id1, move.id2)
            FoMoveType.UNDO -> applyMoveUndo(state)
        }
    }

    private fun applyAutoCloseBranch(state: FoTableauxState, leafID: Int, closeNodeID: Int): FoTableauxState {
        ensureBasicCloseability(state, leafID, closeNodeID)
        val leaf = state.nodes[leafID]
        val closeNode = state.nodes[closeNodeID]

        try {
            val varAssign = Unification.unify(leaf.relation, closeNode.relation)
            return closeBranchCommon(state, leafID, closeNodeID, varAssign)
        } catch (e: UnificationImpossible) {
            throw IllegalMove("Cannot unify '$leaf' and '$closeNode': ${e.message}")
        }
    }

    private fun applyMoveCloseBranch(state: FoTableauxState, leafID: Int, closeNodeID: Int, varAssign: Map<String, FirstOrderTerm>): FoTableauxState {
        ensureBasicCloseability(state, leafID, closeNodeID)
        return closeBranchCommon(state, leafID, closeNodeID, varAssign)
    }

    private fun closeBranchCommon(state: FoTableauxState, leafID: Int, closeNodeID: Int, varAssign: Map<String, FirstOrderTerm>): FoTableauxState {
        applyVarInstantiation(state, varAssign)

        val leaf = state.nodes[leafID]
        val closeNode = state.nodes[closeNodeID]

        if (leaf.relation != closeNode.relation)
            throw IllegalMove("Node '$leaf' and '$closeNode' are not equal after variable instantiation")

        if (state.regular && !checkRegularity(state))
            throw IllegalMove("This variable instantiation would violate the proof regularity")

        // Close branch
        leaf.closeRef = closeNodeID
        setNodeClosed(state, leaf)

        if (state.backtracking)
            state.moveHistory.add(FoTableauxMove(FoMoveType.CLOSE, leafID, closeNodeID, varAssign.mapValues { it.value.toString() }))

        return state
    }

    private fun applyMoveExpandLeaf(state: FoTableauxState, leafID: Int, clauseID: Int): FoTableauxState {
        ensureExpandability(state, leafID, clauseID)
        val clause = state.clauseSet.clauses[clauseID]
        val leaf = state.nodes[leafID]

        val atoms = state.clauseExpandPreprocessing(clause)

        for (atom in atoms) {
            val newLeaf = FoTableauxNode(leafID, atom.lit, atom.negated)
            state.nodes.add(newLeaf)
            leaf.children.add(state.nodes.size - 1)
        }

        // Verify compliance with connectedness criteria
        verifyExpandConnectedness(state, leafID)

        if (state.backtracking)
            state.moveHistory.add(FoTableauxMove(FoMoveType.EXPAND, leafID, clauseID))

        state.expansionCounter += 1

        return state
    }

    private fun applyMoveUndo(state: FoTableauxState): FoTableauxState {
        if (!state.backtracking)
            throw IllegalMove("Backtracking is not enabled for this proof")

        // Create a fresh clone-state with the same parameters and input formula
        val params = FoTableauxParam(state.type, state.regular, state.backtracking)
        var freshState = parseFormulaToState(state.formula, params)
        freshState.usedBacktracking = true

        // We don't want to re-do the last move
        state.moveHistory.removeAt(state.moveHistory.size - 1)

        // Re-build the proof tree in the clone state
        state.moveHistory.forEach {
            freshState = applyMoveOnState(freshState, it)
        }

        return freshState
    }

    override fun checkCloseOnState(state: FoTableauxState) = getCloseMessage(state)

    private fun applyVarInstantiation(state: FoTableauxState, varAssign: Map<String, FirstOrderTerm>): FoTableauxState {
        val instantiator = VariableInstantiator(varAssign)

        state.nodes.forEach {
            it.relation.arguments = it.relation.arguments.map { it.accept(instantiator) }
        }

        return state
    }

    /**
     * Parses a JSON state representation into a TableauxState object
     * @param json JSON state representation
     * @return parsed state object
     */
    @kotlinx.serialization.UnstableDefault
    override fun jsonToState(json: String): FoTableauxState {
        try {
            val parsed = serializer.parse(FoTableauxState.serializer(), json)

            // Ensure valid, unmodified state object
            if (!parsed.verifySeal())
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

            return parsed
        } catch (e: JsonDecodingException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state")
        } catch (e: MissingFieldException) {
            throw JsonParseException(e.message
                    ?: "Could not parse JSON state - missing field")
        } catch (e: SerializationException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state")
        } catch (e: NumberFormatException) {
            throw JsonParseException(e.message
                    ?: "Could not parse JSON state - invalid number format")
        }
    }

    /**
     * Serializes internal state object to JSON
     * @param state State object
     * @return JSON state representation
     */
    @kotlinx.serialization.UnstableDefault
    override fun stateToJson(state: FoTableauxState): String {
        state.render()
        state.computeSeal()
        return serializer.stringify(FoTableauxState.serializer(), state)
    }

    /*
     * Parses a JSON move representation into a TableauxMove object
     * @param json JSON move representation
     * @return parsed move object
     */
    @kotlinx.serialization.UnstableDefault
    override fun jsonToMove(json: String): FoTableauxMove {
        try {
            return Json.parse(FoTableauxMove.serializer(), json)
        } catch (e: JsonDecodingException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move")
        } catch (e: MissingFieldException) {
            throw JsonParseException(e.message
                    ?: "Could not parse JSON move - missing field")
        } catch (e: SerializationException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move")
        } catch (e: NumberFormatException) {
            throw JsonParseException(e.message
                    ?: "Could not parse JSON move - invalid number format")
        }
    }

    /*
     * Parses a JSON parameter representation into a TableauxParam object
     * @param json JSON parameter representation
     * @return parsed param object
     */
    @kotlinx.serialization.UnstableDefault
    override fun jsonToParam(json: String): FoTableauxParam {
        try {
            return Json.parse(FoTableauxParam.serializer(), json)
        } catch (e: JsonDecodingException) {
            throw JsonParseException(e.message ?: "Could not parse JSON params")
        } catch (e: MissingFieldException) {
            throw JsonParseException(e.message
                    ?: "Could not parse JSON params - missing field")
        } catch (e: SerializationException) {
            throw JsonParseException(e.message ?: "Could not parse JSON params")
        } catch (e: NumberFormatException) {
            throw JsonParseException(e.message
                    ?: "Could not parse JSON params - invalid number format")
        }
    }
}
