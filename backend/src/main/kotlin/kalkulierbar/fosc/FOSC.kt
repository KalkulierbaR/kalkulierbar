package kalkulierbar.fosc

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.LogicModule
import kalkulierbar.logic.transform.NegationNormalForm
import kalkulierbar.parsers.FirstOrderSequentParser
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class FOSC : JSONCalculus<FOSCState, FOSCMove, Unit>() {

    private val serializer = Json(context = FoTermModule + LogicModule + FOSCMoveModule + FOSCTreeNodeModule)

    override val identifier = "fosc"

    override fun parseFormulaToState(formula: String, params: Unit?): FOSCState {
        return FirstOrderSequentParser().parse(formula);
    }

    override fun applyMoveOnState(state: FOSCState, move: FOSCMove): FOSCState {
        // Clear status message
        // state.statusMessage = null

        // Pass moves to relevant subfunction
        return when (move) {
            is Ax -> applyAx(state, move.nodeID)
            is NotRight -> applyNotRight(state, move.nodeID, move.listIndex)
            is NotLeft -> applyNotLeft(state, move.nodeID, move.listIndex)
            is OrRight -> applyOrRight(state, move.nodeID, move.listIndex)
            is OrLeft -> applyOrLeft(state, move.nodeID, move.listIndex)
            is AndRight -> applyAndRight(state, move.nodeID, move.listIndex)
            is AndLeft -> applyAndLeft(state, move.nodeID, move.listIndex)
            is UndoMove -> applyUndo(state)
            else -> throw IllegalMove("Unknown move")
        }
    }

    /**
     * Undo a rule application by re-building the state from the move history
     * @param state State in which to apply the undo
     * @return Equivalent state with the most recent rule application removed
     */
    private fun applyUndo(state: FOSCState): FOSCState {
        if(state.tree.size <= 1)
            throw IllegalMove("No move to undo");

        val removedNode = state.tree.removeAt(state.tree.size - 1);

        if (removedNode !is Leaf)
            throw IllegalMove("Rules can only be applied on Leaf level.")

        val parentID: Int? = removedNode.parent;

        val parentNode = state.tree.elementAt(parentID!!);

        if(parentNode is OneChildNode)
            state.tree[parentID] = Leaf(parentNode.parent, parentNode.leftFormula, parentNode.rightFormula);
        else if(parentNode is TwoChildNode){
            state.tree.removeAt(state.tree.size - 1);
            state.tree[parentID] = Leaf(parentNode.parent, parentNode.leftFormula, parentNode.rightFormula);
        }
        return state;
    }

    override fun checkCloseOnState(state: FOSCState): CloseMessage {
        for (node in state.tree) {
            if (node is Leaf) {
                if (node.leftFormula.size != 0 || node.rightFormula.size != 0) {
                    return CloseMessage(false, "Not all branches of the proof tree are closed.")
                }
            }
        }
        
        return CloseMessage(true, "The proof is closed and valid in propositional Logic")
    }

    /**
     * Parses a JSON state representation into a TableauxState object
     * @param json JSON state representation
     * @return parsed state object
     */
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToState(json: String): FOSCState {
        try {
            val parsed = serializer.parse(FOSCState.serializer(), json)

            //Ensure valid, unmodified state object
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
    override fun stateToJson(state: FOSCState): String {
        state.computeSeal()
        return serializer.stringify(FOSCState.serializer(), state)
    }

    /*
     * Parses a JSON move representation into a TableauxMove object
     * @param json JSON move representation
     * @return parsed move object
     */
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToMove(json: String): FOSCMove {
        try {
            return serializer.parse(FOSCMove.serializer(), json)
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
