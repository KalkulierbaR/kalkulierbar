package kalkulierbar.nonclausaltableaux

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.logic.And
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.LogicModule
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.transform.NegationNormalForm
import kalkulierbar.parsers.FirstOrderParser
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

val serializer = Json(context = FoTermModule + LogicModule)

@Suppress("TooManyFunctions")
class NonClausalTableaux : JSONCalculus<NcTableauxState, NcTableauxMove, Unit>() {

    override val identifier = "nc-tableaux"

    override fun parseFormulaToState(formula: String, params: Unit?): NcTableauxState {
        val parsedFormula = NegationNormalForm.transform(FirstOrderParser.parse(formula))

        return NcTableauxState(parsedFormula)
    }

    override fun applyMoveOnState(state: NcTableauxState, move: NcTableauxMove): NcTableauxState {
        // Pass moves to relevant subfunction
        return when (move) {
            is AlphaMove -> applyAlpha(state, move.leafID)
            is BetaMove -> applyBeta(state, move.leafID)
            is GammaMove -> applyGamma(state, move.leafID)
            is DeltaMove -> applyDelta(state, move.leafID)
            is CloseMove -> applyClose(state, move.leafID, move.closeID, move.varAssign)
            is UndoMove -> applyUndo(state)
            else -> throw IllegalMove("Unknown move")
        }
    }

    /**
     * While the outermost LogicNode is an AND:
     * Split into subformulae, chain onto a single branch
     * @param state: Non clausal tableaux state to apply move on
     * @param leafID: leaf node ID to apply move on
     */
    private fun applyAlpha(state: NcTableauxState, leafID: Int): NcTableauxState {
        val nodes = state.nodes
        if (leafID < 0 || leafID >= nodes.size)
            throw IllegalMove("There is no node with ID: $leafID")
        if (!nodes[leafID].isLeaf)
            throw IllegalMove("Selected node is not a leaf")

        val formula = state.formula
        // Get sub-formula splitted by And
        val conjunctions = recursiveAlpha(formula)

        var parent = leafID
        // Add nodes, chained onto a single branch
        for (sub in conjunctions) {
            nodes.add(NcTableauxNode(parent, sub))
            nodes[parent].children.add(nodes.size - 1)
            parent = nodes.size - 1
        }
        return state
    }

    /**
     * While outermost LogicNOde is an AND -> split into subformulae
     * @param node: node to apply splitting
     * @return A list containing LogicNodes so that every element is not a AND
     */
    private fun recursiveAlpha(node: LogicNode): List<LogicNode> {
        val lst = mutableListOf<LogicNode>()
        // Recursively collects all AND LogicNodes
        while (node is And) {
            lst.addAll(recursiveAlpha(node.leftChild))
            lst.addAll(recursiveAlpha(node.rightChild))
        }
        return lst
    }

    private fun applyBeta(state: NcTableauxState, leafID: Int): NcTableauxState {
        // While the outermost LogicNode is an OR:
        // Split into subformulae
        throw IllegalMove("Not Implemented")
    }

    private fun applyGamma(state: NcTableauxState, leafID: Int): NcTableauxState {
        // If outermost LogicNode is a universal quantifier:
        // Remove quantifier and instantiate with fresh variable
        throw IllegalMove("Not Implemented")
    }

    private fun applyDelta(state: NcTableauxState, leafID: Int): NcTableauxState {
        // If outermost LogicNode is an existantial quantifier:
        // Remove quantifier and instantiate with Skolem term
        throw IllegalMove("Not Implemented")
    }

    private fun applyClose(state: NcTableauxState, leafID: Int, closeID: Int, varAssign: Map<String, String>?): NcTableauxState {
        // Note: I believe nodes are closable if:
        //       1. The outermost LogicNode is a NOT for one and RELATION for the other
        //       2. The child of the NOT node is a RELATION (think this is already covered by converting to NNF)
        //       3. Both RELATION nodes are syntactically equal after (global) variable instantiation
        throw IllegalMove("Not Implemented")
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
        throw IllegalMove("Not Implemented")
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
