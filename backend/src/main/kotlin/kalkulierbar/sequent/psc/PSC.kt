package kalkulierbar.sequent.psc

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JsonParseException
import kalkulierbar.ScoredCalculus
import kalkulierbar.logic.LogicModule
import kalkulierbar.parsers.PropositionalSequentParser
import kalkulierbar.sequent.*
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class PSC : GenericSequentCalculus, ScoredCalculus<PSCState, SequentCalculusMove, SequentCalculusParam>() {
    override val identifier = "prop-sequent"

    override val serializer = Json {
        serializersModule = LogicModule + SequentCalculusMoveModule
        encodeDefaults = true
    }
    override val stateSerializer = PSCState.serializer()
    override val moveSerializer = SequentCalculusMove.serializer()

    override fun parseFormulaToState(formula: String, params: SequentCalculusParam?): PSCState {
        val sequents = PropositionalSequentParser.parse(formula)
        return PSCState(
            mutableListOf(TreeNode(sequents.first.toMutableList(), sequents.second.toMutableList())),
            params?.showOnlyApplicableRules ?: false
        )
    }

    @Suppress("ComplexMethod")
    override fun applyMoveOnState(state: PSCState, move: SequentCalculusMove): PSCState {
        // Pass moves to relevant subfunction
        return when (move) {
            is Ax -> applyAx(state, move.nodeID) as PSCState
            is NotRight -> applyNotRight(state, move.nodeID, move.listIndex) as PSCState
            is NotLeft -> applyNotLeft(state, move.nodeID, move.listIndex) as PSCState
            is OrRight -> applyOrRight(state, move.nodeID, move.listIndex) as PSCState
            is OrLeft -> applyOrLeft(state, move.nodeID, move.listIndex) as PSCState
            is AndRight -> applyAndRight(state, move.nodeID, move.listIndex) as PSCState
            is AndLeft -> applyAndLeft(state, move.nodeID, move.listIndex) as PSCState
            is ImpRight -> applyImpRight(state, move.nodeID, move.listIndex) as PSCState
            is ImpLeft -> applyImpLeft(state, move.nodeID, move.listIndex) as PSCState
            is UndoMove -> applyUndo(state) as PSCState
            is PruneMove -> applyPrune(state, move.nodeID) as PSCState
            else -> throw IllegalMove("Unknown move")
        }
    }

    override fun checkCloseOnState(state: PSCState): CloseMessage {
        return if (state.tree.all { it.isClosed })
            CloseMessage(true, "The proof is closed and valid in Propositional Logic")
        else
            CloseMessage(false, "Not all branches of the proof tree are closed")
    }

    /*
     * Parses a JSON parameter representation into a TableauxParam object
     * @param json JSON parameter representation
     * @return parsed param object
     */
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToParam(json: String): SequentCalculusParam {
        try {
            return serializer.decodeFromString(json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON params"
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    override fun scoreFromState(state: PSCState, name: String?): Map<String, String> = stateToStat(state, name)
    override fun formulaFromState(state: PSCState) = state.tree[0].toString()
}
