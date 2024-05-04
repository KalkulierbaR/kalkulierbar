package kalkulierbar.sequent.fo

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JsonParseException
import kalkulierbar.ScoredCalculus
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.LogicModule
import kalkulierbar.parsers.FirstOrderSequentParser
import kalkulierbar.sequent.AllLeft
import kalkulierbar.sequent.AllRight
import kalkulierbar.sequent.AndLeft
import kalkulierbar.sequent.AndRight
import kalkulierbar.sequent.Ax
import kalkulierbar.sequent.ExLeft
import kalkulierbar.sequent.ExRight
import kalkulierbar.sequent.GenericSequentCalculus
import kalkulierbar.sequent.ImpLeft
import kalkulierbar.sequent.ImpRight
import kalkulierbar.sequent.NotLeft
import kalkulierbar.sequent.NotRight
import kalkulierbar.sequent.OrLeft
import kalkulierbar.sequent.OrRight
import kalkulierbar.sequent.PruneMove
import kalkulierbar.sequent.SequentCalculusMove
import kalkulierbar.sequent.SequentCalculusMoveModule
import kalkulierbar.sequent.SequentCalculusParam
import kalkulierbar.sequent.TreeNode
import kalkulierbar.sequent.UndoMove
import kalkulierbar.sequent.applyAndLeft
import kalkulierbar.sequent.applyAndRight
import kalkulierbar.sequent.applyAx
import kalkulierbar.sequent.applyImpLeft
import kalkulierbar.sequent.applyImpRight
import kalkulierbar.sequent.applyNotLeft
import kalkulierbar.sequent.applyNotRight
import kalkulierbar.sequent.applyOrLeft
import kalkulierbar.sequent.applyOrRight
import kalkulierbar.sequent.applyPrune
import kalkulierbar.sequent.applyUndo
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class FirstOrderSequent :
    GenericSequentCalculus,
    ScoredCalculus<FirstOrderSequentState, SequentCalculusMove, SequentCalculusParam>() {
    override val identifier = "fo-sequent"

    override val serializer = Json {
        serializersModule = FoTermModule + LogicModule + SequentCalculusMoveModule
        encodeDefaults = true
    }
    override val stateSerializer = FirstOrderSequentState.serializer()
    override val moveSerializer = SequentCalculusMove.serializer()

    override fun parseFormulaToState(formula: String, params: SequentCalculusParam?): FirstOrderSequentState {
        val sequents = FirstOrderSequentParser.parse(formula)
        return FirstOrderSequentState(
            mutableListOf(TreeNode(sequents.first.toMutableList(), sequents.second.toMutableList())),
            params?.showOnlyApplicableRules ?: false,
        )
    }

    @Suppress("ComplexMethod")
    override fun applyMoveOnState(state: FirstOrderSequentState, move: SequentCalculusMove): FirstOrderSequentState {
        // Pass moves to relevant subfunction
        return when (move) {
            is Ax -> applyAx(state, move.nodeID) as FirstOrderSequentState
            is NotRight -> applyNotRight(state, move.nodeID, move.listIndex) as FirstOrderSequentState
            is NotLeft -> applyNotLeft(state, move.nodeID, move.listIndex) as FirstOrderSequentState
            is OrRight -> applyOrRight(state, move.nodeID, move.listIndex) as FirstOrderSequentState
            is OrLeft -> applyOrLeft(state, move.nodeID, move.listIndex) as FirstOrderSequentState
            is AndRight -> applyAndRight(state, move.nodeID, move.listIndex) as FirstOrderSequentState
            is AndLeft -> applyAndLeft(state, move.nodeID, move.listIndex) as FirstOrderSequentState
            is ImpRight -> applyImpRight(state, move.nodeID, move.listIndex) as FirstOrderSequentState
            is ImpLeft -> applyImpLeft(state, move.nodeID, move.listIndex) as FirstOrderSequentState
            is AllRight -> applyAllRight(state, move.nodeID, move.listIndex, move.instTerm)
            is AllLeft -> applyAllLeft(state, move.nodeID, move.listIndex, move.instTerm)
            is ExRight -> applyExRight(state, move.nodeID, move.listIndex, move.instTerm)
            is ExLeft -> applyExLeft(state, move.nodeID, move.listIndex, move.instTerm)
            is UndoMove -> applyUndo(state) as FirstOrderSequentState
            is PruneMove -> applyPrune(state, move.nodeID) as FirstOrderSequentState
            else -> throw IllegalMove("Unknown move")
        }
    }

    override fun checkCloseOnState(state: FirstOrderSequentState): CloseMessage {
        return if (state.tree.all { it.isClosed }) {
            CloseMessage(true, "The proof is closed and valid in First Order Logic")
        } else {
            CloseMessage(false, "Not all branches of the proof tree are closed")
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
            return serializer.decodeFromString(json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON params"
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    override fun scoreFromState(
        state: FirstOrderSequentState,
        name: String?,
    ): Map<String, String> = stateToStat(state, name)
    override fun formulaFromState(state: FirstOrderSequentState) = state.tree[0].toString()
}
