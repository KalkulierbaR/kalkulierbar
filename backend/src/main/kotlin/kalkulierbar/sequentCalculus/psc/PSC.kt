package kalkulierbar.sequentCalculus.psc

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.Statistic
import kalkulierbar.StatisticCalculus
import kalkulierbar.logic.LogicModule
import kalkulierbar.parsers.PropositionalSequentParser
import kalkulierbar.sequentCalculus.*
import kalkulierbar.sequentCalculus.GenericSequentCalculus
import kalkulierbar.sequentCalculus.GenericSequentCalculusNodeModule
import kalkulierbar.sequentCalculus.SequentCalculusMove
import kalkulierbar.sequentCalculus.SequentCalculusMove.*
import kalkulierbar.sequentCalculus.SequentCalculusMoveModule
import kalkulierbar.sequentCalculus.moveImplementations.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus
import kotlinx.serialization.list


class PSC : GenericSequentCalculus, JSONCalculus<PSCState, SequentCalculusMove, SequentCalculusParam>(), StatisticCalculus<PSCState> {

    private val serializer = Json(context = LogicModule + SequentCalculusMoveModule + GenericSequentCalculusNodeModule)

    override val identifier = "psc"

    override fun parseFormulaToState(formula: String, params: SequentCalculusParam?): PSCState {
        if (params == null) {
            return PropositionalSequentParser().parse(formula)
        } else {
            val state = PropositionalSequentParser().parse(formula)
            state.showOnlyApplicableRules = params.showOnlyApplicableRules
            return state
        }
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
        for (node in state.tree) {
            if (!node.isClosed) {
                return CloseMessage(false, "Not all branches of the proof tree are closed.")
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
    override fun stateToJson(state: PSCState): String {
        state.computeSeal()
        return serializer.stringify(PSCState.serializer(), state)
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

    /**
    * Calculates the statistics for a given proof
    * @param state A closed state
    * @return The statistics for the given state
    */
    override fun getStatistic(state: String, name: String?): String {
        val statistic = getStatisticOnState(jsonToState(state))
        if (name != null)
            statistic.userName = name
        return statisticToJson(statistic)
    }

    /**
     * Takes in a State of the given calculus
     * @param state Current state object
     * @return The statisitcs of the given object
     */
    override fun getStatisticOnState(state: PSCState): Statistic {
        return SequentCalculusStatistic(state.tree.size, null)
    }

    /**
     * Serializes a statistics object to JSON
     * @param statistic Statistics object
     * @return JSON statistics representation
     */
    override fun statisticToJson(statistic: Statistic): String {
        return serializer.stringify(SequentCalculusStatistic.serializer(), (statistic as SequentCalculusStatistic))
    }

    /**
     * Serializes a List<Statistic> object to JSON
     * @param statistic Statistics object
     * @return JSON statistics representation
     */
    override fun statisticsToJson(statistics: List<Statistic>): String {
        return serializer.stringify(SequentCalculusStatistic.serializer().list, (statistics as List<SequentCalculusStatistic>))
    }

    /**
     * Parses a json object to Statistic
     * @param statistic Statistics object
     * @return JSON statistics representation
     */
    override fun jsonToStatistic(json: String): Statistic {
        return serializer.parse(SequentCalculusStatistic.serializer(), json)
    }

    /**
     * Returns the intitial formula of the state.
     * @param state state representation
     * @return string representing the initial formula of the state
     */
    override fun getStartingFormula(state: String): String {
        return jsonToState(state).tree[0].toString()
    }
}
