package kalkulierbar.sequent.prop

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

class PropositionalSequent : GenericSequentCalculus, ScoredCalculus<PropositionalSequentState, SequentCalculusMove, SequentCalculusParam>() {
    override val identifier = "prop-sequent"

    override val serializer = Json {
        serializersModule = LogicModule + SequentCalculusMoveModule
        encodeDefaults = true
    }
    override val stateSerializer = PropositionalSequentState.serializer()
    override val moveSerializer = SequentCalculusMove.serializer()

    override fun parseFormulaToState(formula: String, params: SequentCalculusParam?): PropositionalSequentState {
        val sequents = PropositionalSequentParser.parse(formula)
        return PropositionalSequentState(
            mutableListOf(TreeNode(sequents.first.toMutableList(), sequents.second.toMutableList())),
            params?.showOnlyApplicableRules ?: false
        )
    }

    @Suppress("ComplexMethod")
    override fun applyMoveOnState(state: PropositionalSequentState, move: SequentCalculusMove): PropositionalSequentState {
        // Pass moves to relevant subfunction
        return when (move) {
            is Ax -> applyAx(state, move.nodeID) as PropositionalSequentState
            is NotRight -> applyNotRight(state, move.nodeID, move.listIndex) as PropositionalSequentState
            is NotLeft -> applyNotLeft(state, move.nodeID, move.listIndex) as PropositionalSequentState
            is OrRight -> applyOrRight(state, move.nodeID, move.listIndex) as PropositionalSequentState
            is OrLeft -> applyOrLeft(state, move.nodeID, move.listIndex) as PropositionalSequentState
            is AndRight -> applyAndRight(state, move.nodeID, move.listIndex) as PropositionalSequentState
            is AndLeft -> applyAndLeft(state, move.nodeID, move.listIndex) as PropositionalSequentState
            is ImpRight -> applyImpRight(state, move.nodeID, move.listIndex) as PropositionalSequentState
            is ImpLeft -> applyImpLeft(state, move.nodeID, move.listIndex) as PropositionalSequentState
            is UndoMove -> applyUndo(state) as PropositionalSequentState
            is PruneMove -> applyPrune(state, move.nodeID) as PropositionalSequentState
            else -> throw IllegalMove("Unknown move")
        }
    }

    override fun checkCloseOnState(state: PropositionalSequentState): CloseMessage {
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

    override fun scoreFromState(state: PropositionalSequentState, name: String?): Map<String, String> = stateToStat(state, name)
    override fun formulaFromState(state: PropositionalSequentState) = state.tree[0].toString()
}
