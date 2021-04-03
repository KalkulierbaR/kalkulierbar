package kalkulierbar.signedtableaux

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.Statistic
import kalkulierbar.StatisticCalculus
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.LogicModule
import kalkulierbar.parsers.ModalLogicParser
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class SignedModalTableaux :
    JSONCalculus<SignedModalTableauxState, SignedModalTableauxMove, SignedModalTableauxParam>(),
    StatisticCalculus<SignedModalTableauxState> {

    private val serializer = Json(context = FoTermModule + LogicModule + SignedModalTablueaxMoveModule)

    override val identifier = "signed-modal-tableaux"

    override fun parseFormulaToState(formula: String, params: SignedModalTableauxParam?): SignedModalTableauxState {

        var regex = Regex("[\\s]*\\\\sign[\\s]+[TF]:")

        val match = regex.find(formula)
        var formulaString = formula
        var startIndex = 0
        var assumption = false

        if (match != null) {
            if (match.range.start == 0) {
                startIndex = match.range.last + 1
                formulaString = formula.substring(startIndex)
                if (formula.get(startIndex - 2) == 'T')
                    assumption = true
            } else {
                throw InvalidFormulaFormat("\\sign T: or \\sign F: needs to be at the start of the formula")
            }
        }

        var parsedFormula = ModalLogicParser().parse(formulaString, startIndex)

        if (params == null)
            return SignedModalTableauxState(parsedFormula, assumption)
        else
            return SignedModalTableauxState(parsedFormula, assumption, params.backtracking)
    }

    @Suppress("ComplexMethod")
    override fun applyMoveOnState(state: SignedModalTableauxState, move: SignedModalTableauxMove): SignedModalTableauxState {
        // Clear status message
        state.statusMessage = null

        // Pass moves to relevant subfunction
        return when (move) {
            is Negation -> applyNegation(state, move.nodeID, move.leafID)
            is AlphaMove -> applyAlpha(state, move.nodeID, move.leafID)
            is BetaMove -> applyBeta(state, move.nodeID, move.leafID)
            is NuMove -> applyNu(state, move.prefix, move.nodeID, move.leafID)
            is PiMove -> applyPi(state, move.prefix, move.nodeID, move.leafID)
            is Prune -> applyPrune(state, move.nodeID)
            is CloseMove -> applyClose(state, move.nodeID, move.leafID)
            is UndoMove -> applyUndo(state)
            else -> throw IllegalMove("Unknown move")
        }
    }

    /**
     * Undo a rule application by re-building the state from the move history
     * @param state State in which to apply the undo
     * @return Equivalent state with the most recent rule application removed
     */
    private fun applyUndo(state: SignedModalTableauxState): SignedModalTableauxState {
        if (!state.backtracking)
            throw IllegalMove("Backtracking is not enabled for this proof")

        // Can't undo any more moves in initial state
        if (state.moveHistory.isEmpty())
            return state

        // Create a fresh clone-state with the same parameters and input formula
        var freshState = SignedModalTableauxState(state.formula, state.assumption, state.backtracking)
        freshState.usedBacktracking = true

        // We don't want to re-do the last move
        state.moveHistory.removeAt(state.moveHistory.size - 1)

        // Re-build the proof tree in the clone state
        state.moveHistory.forEach {
            freshState = applyMoveOnState(freshState, it)
        }

        return freshState
    }

    override fun checkCloseOnState(state: SignedModalTableauxState): CloseMessage {
        var msg = "The proof tree is not closed"

        if (state.nodes[0].isClosed) {
            val withWithoutBT = if (state.usedBacktracking) "with" else "without"
            msg = "The proof is closed and valid in signed modal-logic tableaux $withWithoutBT backtracking"
        }

        return CloseMessage(state.nodes[0].isClosed, msg)
    }

    /**
     * Parses a JSON state representation into a TableauxState object
     * @param json JSON state representation
     * @return parsed state object
     */
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToState(json: String): SignedModalTableauxState {
        try {
            val parsed = serializer.parse(SignedModalTableauxState.serializer(), json)

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
    override fun stateToJson(state: SignedModalTableauxState): String {
        state.render()
        state.computeSeal()
        return serializer.stringify(SignedModalTableauxState.serializer(), state)
    }

    /*
     * Parses a JSON move representation into a TableauxMove object
     * @param json JSON move representation
     * @return parsed move object
     */
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToMove(json: String): SignedModalTableauxMove {
        try {
            return serializer.parse(SignedModalTableauxMove.serializer(), json)
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
    override fun jsonToParam(json: String): SignedModalTableauxParam {
        try {
            return serializer.parse(SignedModalTableauxParam.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON Param: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    /**
    * Calculates the statistics for a given proof
    * @param state A closed state
    * @return The statistics for the given state
    */
    override fun getStatistic(state: String, name: String?): String {
        val statistic = SignedModalTableauxStatistic(jsonToState(state))
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
        return serializer.stringify(SignedModalTableauxStatistic.serializer(), (statistic as SignedModalTableauxStatistic))
    }

    /**
     * Parses a json object to Statistic
     * @param statistic Statistics object
     * @return JSON statistics representation
     */
    override fun jsonToStatistic(json: String): Statistic {
        return serializer.parse(SignedModalTableauxStatistic.serializer(), json)
    }

    /**
     * Returns the intitial formula of the state.
     * @param state state representation
     * @return string representing the initial formula of the state
     */
    override fun getStartingFormula(state: String): String {
        return jsonToState(state).nodes[0].toString()
    }
}
