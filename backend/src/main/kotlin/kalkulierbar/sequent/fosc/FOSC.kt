package kalkulierbar.sequent.fosc

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.Statistic
import kalkulierbar.StatisticCalculus
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.LogicModule
import kalkulierbar.parsers.FirstOrderSequentParser
import kalkulierbar.sequent.*
import kalkulierbar.sequent.GenericSequentCalculus
import kalkulierbar.sequent.SequentCalculusMove
import kalkulierbar.sequent.SequentCalculusMoveModule
import kalkulierbar.sequent.TreeNode
import kalkulierbar.sequent.fosc.moveImplementations.*
import kalkulierbar.sequent.moveImplementations.*
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class FOSC :
    GenericSequentCalculus,
    JSONCalculus<FOSCState, SequentCalculusMove, SequentCalculusParam>(),
    StatisticCalculus<FOSCState> {
    override val identifier = "fosc"

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

    /**
     * Calculates the statistics for a given proof
     * @param state A closed state
     * @return The statistics for the given state
     */
    override fun getStatistic(state: String, name: String?): String {
        val statistic = SequentCalculusStatistic(jsonToState(state))
        if (name != null)
            statistic.userName = name
        return statisticToJson(statistic)
    }

    /**
     * Serializes a statistics object to JSON
     * @param statistic Statistics object
     * @return JSON statistics representation
     */
    override fun statisticToJson(statistic: Statistic): String {
        return serializer.encodeToString(statistic as SequentCalculusStatistic)
    }

    /**
     * Parses a json object to Statistic
     * @param json JSON statistics representation
     * @return Statistics object
     */
    override fun jsonToStatistic(json: String): Statistic {
        return serializer.decodeFromString(json)
    }

    /**
     * Returns the initial formula of the state.
     * @param state state representation
     * @return string representing the initial formula of the state
     */
    override fun getStartingFormula(state: String): String {
        return jsonToState(state).tree[0].toString()
    }
}
