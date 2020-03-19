package kalkulierbar.nonclausaltableaux

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.UnificationImpossible
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.LogicModule
import kalkulierbar.logic.Not
import kalkulierbar.logic.Relation
import kalkulierbar.logic.transform.LogicNodeVariableInstantiator
import kalkulierbar.logic.transform.NegationNormalForm
import kalkulierbar.logic.transform.Unification
import kalkulierbar.parsers.FirstOrderParser
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class NonClausalTableaux : JSONCalculus<NcTableauxState, NcTableauxMove, Unit>() {

    private val serializer = Json(context = FoTermModule + LogicModule + NcMoveModule)

    override val identifier = "nc-tableaux"

    override fun parseFormulaToState(formula: String, params: Unit?): NcTableauxState {
        val parsedFormula = NegationNormalForm.transform(FirstOrderParser.parse(formula))

        return NcTableauxState(parsedFormula)
    }

    override fun applyMoveOnState(state: NcTableauxState, move: NcTableauxMove): NcTableauxState {
        // Pass moves to relevant subfunction
        return when (move) {
            is AlphaMove -> applyAlpha(state, move.nodeID)
            is BetaMove -> applyBeta(state, move.nodeID)
            is GammaMove -> applyGamma(state, move.nodeID)
            is DeltaMove -> applyDelta(state, move.nodeID)
            is CloseMove -> applyClose(state, move.nodeID, move.closeID, move.getVarAssignTerms())
            is UndoMove -> applyUndo(state)
            else -> throw IllegalMove("Unknown move")
        }
    }

    /**
     * Applies close move by following constraints:
     * 1. The outermost LogicNode is a NOT for one and RELATION for the other
     * 2. The child of the NOT node is a RELATION (think this is already covered by converting to NNF)
     * 3. Both RELATION nodes are syntactically equal after (global) variable instantiation
     * @param state State to apply close move on
     * @param nodeID Node to close
     * @param closeID Node to close with
     * @param varAssign variable assignment to instantiate variables
     * @return state after applying move
     */
    @Suppress("ThrowsCount", "ComplexMethod", "LongMethod")
    private fun applyClose(
        state: NcTableauxState,
        nodeID: Int,
        closeID: Int,
        varAssign: Map<String, FirstOrderTerm>?
    ): NcTableauxState {
        val nodes = state.nodes

        // Verify that both node and closeNode are valid nodes
        if (nodeID >= nodes.size || nodeID < 0)
            throw IllegalMove("Node with ID $nodeID does not exist")
        if (closeID >= nodes.size || closeID < 0)
            throw IllegalMove("Node with ID $closeID does not exist")

        val node = state.nodes[nodeID]
        val closeNode = state.nodes[closeID]

        // Verify that node is not already closed
        if (node.isClosed)
            throw IllegalMove("Node '$node' is already closed, no need to close again")

        // Verify that closeNode is transitive parent of node
        if (!state.nodeIsParentOf(closeID, nodeID))
            throw IllegalMove("Node '$closeNode' is not an ancestor of node '$node'")

        val nodeFormula = node.formula
        val closeNodeFormula = closeNode.formula
        val nodeRelation: Relation
        val closeRelation: Relation

        // Verify that node and closeNode are (negated) Relations of compatible polarity
        when {
            nodeFormula is Not -> {
                if (nodeFormula.child !is Relation)
                    throw IllegalMove("Node formula '$nodeFormula' is not a negated relation")
                if (closeNodeFormula !is Relation)
                    throw IllegalMove("Close node formula '$closeNodeFormula' is not a relation")
                nodeRelation = nodeFormula.child as Relation
                closeRelation = closeNodeFormula
            }
            closeNodeFormula is Not -> {
                if (closeNodeFormula.child !is Relation)
                    throw IllegalMove("Close node formula '$closeNodeFormula' is not a negated relation")
                if (nodeFormula !is Relation)
                    throw IllegalMove("Node formula '$nodeFormula' is not a relation")
                nodeRelation = nodeFormula
                closeRelation = closeNodeFormula.child as Relation
            }
            else -> {
                throw IllegalMove("Neither '$nodeFormula' nor '$closeNodeFormula' are negated")
            }
        }

        // Use user-supplied variable assignment if given, calculate MGU otherwise
        val unifier: Map<String, FirstOrderTerm>
        unifier = varAssign
                ?: try {
                    Unification.unify(nodeRelation, closeRelation)
                } catch (e: UnificationImpossible) {
                    throw IllegalMove("Cannot unify '$nodeRelation' and '$closeRelation': ${e.message}")
                }

        // Apply all specified variable instantiations globally
        val instantiator = LogicNodeVariableInstantiator(unifier)
        state.nodes.forEach {
            it.formula = it.formula.accept(instantiator)
        }

        // Check relations after instantiation
        if (!nodeRelation.synEq(closeRelation))
            throw IllegalMove("Relations '$nodeRelation' and '$closeRelation' are" +
                    " not equal after variable instantiation")

        // Close branch
        node.closeRef = closeID
        state.setClosed(nodeID)

        // Record close move for backtracking purposes
        if (state.backtracking) {
            val varAssignStrings = unifier.mapValues { it.value.toString() }
            val move = CloseMove(nodeID, closeID, varAssignStrings)
            state.moveHistory.add(move)
        }

        return state
    }

    /**
     * Undo a rule application by re-building the state from the move history
     * @param state State in which to apply the undo
     * @return Equivalent state with the most recent rule application removed
     */
    private fun applyUndo(state: NcTableauxState): NcTableauxState {
        if (!state.backtracking)
            throw IllegalMove("Backtracking is not enabled for this proof")

        // Can't undo any more moves in initial state
        if (state.moveHistory.isEmpty())
            return state

        // Create a fresh clone-state with the same parameters and input formula
        var freshState = NcTableauxState(state.formula)
        freshState.usedBacktracking = true

        // We don't want to re-do the last move
        state.moveHistory.removeAt(state.moveHistory.size - 1)

        // Re-build the proof tree in the clone state
        state.moveHistory.forEach {
            freshState = applyMoveOnState(freshState, it)
        }

        return freshState
    }

    override fun checkCloseOnState(state: NcTableauxState): CloseMessage {
        var msg = "The proof tree is not closed"

        if (state.nodes[0].isClosed) {
            val withWithoutBT = if (state.usedBacktracking) "with" else "without"
            msg = "The proof is closed and valid in non-clausal tableaux $withWithoutBT backtracking"
        }

        return CloseMessage(state.nodes[0].isClosed, msg)
    }

    /**
     * Parses a JSON state representation into a TableauxState object
     * @param json JSON state representation
     * @return parsed state object
     */
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToState(json: String): NcTableauxState {
        try {
            val parsed = serializer.parse(NcTableauxState.serializer(), json)

            // Ensure valid, unmodified state object
            if (!parsed.verifySeal())
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

            return parsed
        } catch (e: Exception) {
            val msg = "Could not parse JSON state: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    /**
     * Serializes internal state object to JSON
     * @param state State object
     * @return JSON state representation
     */
    override fun stateToJson(state: NcTableauxState): String {
        state.render()
        state.computeSeal()
        return serializer.stringify(NcTableauxState.serializer(), state)
    }

    /*
     * Parses a JSON move representation into a TableauxMove object
     * @param json JSON move representation
     * @return parsed move object
     */
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToMove(json: String): NcTableauxMove {
        try {
            return serializer.parse(NcTableauxMove.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON move: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    /*
     * Parses a JSON parameter representation into a TableauxParam object
     * @param json JSON parameter representation
     * @return parsed param object
     */
    override fun jsonToParam(json: String) = Unit
}
