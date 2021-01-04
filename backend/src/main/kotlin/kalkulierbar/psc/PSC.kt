package kalkulierbar.psc

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.LogicModule
import kalkulierbar.logic.transform.NegationNormalForm
import kalkulierbar.parsers.PropositionalParser
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class PSC : JSONCalculus<PSCState, PSCMove, Unit>() {

    private val serializer = Json(context = FoTermModule + LogicModule + PSCMoveModule + PSCTreeNodeModule)

    override val identifier = "psc"

    override fun parseFormulaToState(formula: String, params: Unit?): PSCState {
        val parsedFormula = PropositionalParser().parse(formula)
        return PSCState(parsedFormula)
    }

    override fun applyMoveOnState(state: PSCState, move: PSCMove): PSCState {
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
    private fun applyUndo(state: PSCState): PSCState {
        // if (!state.backtracking)
        //     throw IllegalMove("Backtracking is not enabled for this proof")

        // // Can't undo any more moves in initial state
        // if (state.moveHistory.isEmpty())
        //     return state

        // // Create a fresh clone-state with the same parameters and input formula
        // var freshState = kalkulierbar.psc.PSCState(state.formula)
        // freshState.usedBacktracking = true

        // // We don't want to re-do the last move
        // state.moveHistory.removeAt(state.moveHistory.size - 1)

        // // Re-build the proof tree in the clone state
        // state.moveHistory.forEach {
        //     freshState = applyMoveOnState(freshState, it)
        // }

        // return freshState
        return state;
    }

    override fun checkCloseOnState(state: PSCState): CloseMessage {
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
    override fun jsonToState(json: String): PSCState {
        try {
            val parsed = serializer.parse(PSCState.serializer(), json)

            // Ensure valid, unmodified state object
            // if (!parsed.verifySeal())
            //     throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

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
    override fun stateToJson(state: PSCState): String {
        // state.render()
        // state.computeSeal()
        return serializer.stringify(PSCState.serializer(), state)
    }

    /*
     * Parses a JSON move representation into a TableauxMove object
     * @param json JSON move representation
     * @return parsed move object
     */
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToMove(json: String): PSCMove {
        try {
            return serializer.parse(PSCMove.serializer(), json)
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
