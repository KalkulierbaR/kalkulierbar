package kalkulierbar.sequentCalculus.fosc

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.LogicModule
import kalkulierbar.parsers.FirstOrderSequentParser
import kalkulierbar.sequentCalculus.*
import kalkulierbar.sequentCalculus.GenericSequentCalculus
import kalkulierbar.sequentCalculus.GenericSequentCalculusNodeModule
import kalkulierbar.sequentCalculus.SequentCalculusMove
import kalkulierbar.sequentCalculus.SequentCalculusMoveModule
import kalkulierbar.sequentCalculus.fosc.moveImplementations.*
import kalkulierbar.sequentCalculus.moveImplementations.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class FOSC : GenericSequentCalculus, JSONCalculus<FOSCState, SequentCalculusMove, SequentCalculusParam>() {

    private val serializer = Json(context = FoTermModule + LogicModule + SequentCalculusMoveModule + GenericSequentCalculusNodeModule)

    override val identifier = "fosc"

    override fun parseFormulaToState(formula: String, params: SequentCalculusParam?): FOSCState {
        if (params == null) {
            return FirstOrderSequentParser().parse(formula)
        } else {
            val state = FirstOrderSequentParser().parse(formula)
            state.showOnlyApplicableRules = params.showOnlyApplicableRules
            return state
        }
    }

    @Suppress("ComplexMethod")
    override fun applyMoveOnState(state: FOSCState, move: SequentCalculusMove): FOSCState {
        // Pass moves to relevant subfunction
        return when (move) {
            is Ax -> applyAx(state, move.nodeID) as FOSCState
            is NotRight -> applyNotRight(state, move.nodeID, move.listIndex) as FOSCState
            is NotLeft -> applyNotLeft(state, move.nodeID, move.listIndex) as FOSCState
            is OrRight -> applyOrRight(state, move.nodeID, move.listIndex) as FOSCState
            is OrLeft -> applyOrLeft(state, move.nodeID, move.listIndex) as FOSCState
            is AndRight -> applyAndRight(state, move.nodeID, move.listIndex) as FOSCState
            is AndLeft -> applyAndLeft(state, move.nodeID, move.listIndex) as FOSCState
            is ImpRight -> applyImpRight(state, move.nodeID, move.listIndex) as FOSCState
            is ImpLeft -> applyImpLeft(state, move.nodeID, move.listIndex) as FOSCState
            is AllRight -> applyAllRight(state, move.nodeID, move.listIndex, move.varAssign)
            is AllLeft -> applyAllLeft(state, move.nodeID, move.listIndex, move.varAssign)
            is ExRight -> applyExRight(state, move.nodeID, move.listIndex, move.varAssign)
            is ExLeft -> applyExLeft(state, move.nodeID, move.listIndex, move.varAssign)
            is UndoMove -> applyUndo(state) as FOSCState
            is PruneMove -> applyPrune(state, move.nodeID) as FOSCState
            else -> throw IllegalMove("Unknown move")
        }
    }

    override fun checkCloseOnState(state: FOSCState): CloseMessage {
        for (node in state.tree) {
            if (!node.isClosed) {
                return CloseMessage(false, "Not all branches of the proof tree are closed.")
            }
        }

        return CloseMessage(true, "The proof is closed and valid in First Order Logic")
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
    override fun jsonToMove(json: String): SequentCalculusMove {
        try {
            return serializer.parse(SequentCalculusMove.serializer(), json)
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
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToParam(json: String): SequentCalculusParam {
        try {
            return serializer.parse(SequentCalculusParam.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON params"
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }
}
