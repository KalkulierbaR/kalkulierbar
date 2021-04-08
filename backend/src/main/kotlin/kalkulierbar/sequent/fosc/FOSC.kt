package kalkulierbar.sequent.fosc

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JsonParseException
import kalkulierbar.ScoredCalculus
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.LogicModule
import kalkulierbar.parsers.FirstOrderSequentParser
import kalkulierbar.sequent.*
import kalkulierbar.sequent.fosc.moveImplementations.applyAllLeft
import kalkulierbar.sequent.fosc.moveImplementations.applyAllRight
import kalkulierbar.sequent.fosc.moveImplementations.applyExLeft
import kalkulierbar.sequent.fosc.moveImplementations.applyExRight
import kalkulierbar.sequent.moveImplementations.*
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class FOSC :
    GenericSequentCalculus,
    ScoredCalculus<FOSCState, SequentCalculusMove, SequentCalculusParam>() {
    override val identifier = "fo-sequent"

    override val serializer = Json {
        serializersModule = FoTermModule + LogicModule + SequentCalculusMoveModule
        encodeDefaults = true
    }
    override val stateSerializer = FOSCState.serializer()
    override val moveSerializer = SequentCalculusMove.serializer()

    override fun parseFormulaToState(formula: String, params: SequentCalculusParam?): FOSCState {
        val sequents = FirstOrderSequentParser.parse(formula)
        return FOSCState(
            mutableListOf(TreeNode(sequents.first.toMutableList(), sequents.second.toMutableList())),
            params?.showOnlyApplicableRules ?: false
        )
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
        return if (state.tree.all { it.isClosed })
            CloseMessage(true, "The proof is closed and valid in First Order Logic")
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

    override fun scoreFromState(state: FOSCState, name: String?): Map<String, String> = stateToStat(state, name)
    override fun formulaFromState(state: FOSCState) = state.tree[0].toString()
}
