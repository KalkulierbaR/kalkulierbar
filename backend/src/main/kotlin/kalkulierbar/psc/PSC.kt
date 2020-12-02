package kalkulierbar.psc

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.parsers.FlexibleClauseSetParser
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus
import kotlinx.serialization.Serializable

class PSC : JSONCalculus<PSCState, PSCMove, Unit>() {

    override val identifier = "psc";

    private val serializer = Json(context = pscMoveModule)


    override fun parseFormulaToState(formula: String, params: Unit?): PSCState {
        // val clauses = FlexibleClauseSetParser.parse(formula)
        // val state = DPLLState(clauses)
        // state.tree.add(TreeNode(null, NodeType.ROOT, "true", Identity()))

        val state = PSCState(formula);

        return state
    }

    override fun applyMoveOnState(state: PSCState, move: PSCMove): PSCState {
        when (move) {
            // is MoveNotLeft -> notLeft(state: PSCState, move: PSCMove);
            else -> throw IllegalMove("Unknown move")
        }
        return state
    }

    // override fun checkClose(state: String) = closeToJson(checkCloseOnState(jsonToState(state)))

    override fun checkCloseOnState(state: PSCState): CloseMessage {
        return CloseMessage(false, "Proof is not closed")
    }

    @Suppress("TooGenericExceptionCaught")
    override fun jsonToState(json: String): PSCState {
        try {
            val parsed = serializer.parse(PSCState.serializer(), json)

            // Ensure valid, unmodified state object
            return parsed
        } catch (e: Exception) {
            val msg = "Could not parse JSON state: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    override fun stateToJson(state: PSCState): String {
        return serializer.stringify(PSCState.serializer(), state)
    }

    @Suppress("TooGenericExceptionCaught")
    override fun jsonToMove(json: String): PSCMove {
        try {
            return serializer.parse(PSCMove.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON move: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    override fun jsonToParam(json: String) = Unit
}