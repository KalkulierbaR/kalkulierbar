package kalkulierbar.signedtableaux

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JsonParseException
import kalkulierbar.ScoredCalculus
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.LogicModule
import kalkulierbar.parsers.ModalLogicParser
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus
import kotlin.math.sqrt

class SignedModalTableaux :
    ScoredCalculus<SignedModalTableauxState, SignedModalTableauxMove, SignedModalTableauxParam>() {

    override val serializer = Json {
        serializersModule = FoTermModule + LogicModule + SignedModalTableauxMoveModule
        encodeDefaults = true
    }
    override val stateSerializer = SignedModalTableauxState.serializer()
    override val moveSerializer = SignedModalTableauxMove.serializer()

    override val identifier = "signed-modal-tableaux"

    override fun parseFormulaToState(formula: String, params: SignedModalTableauxParam?): SignedModalTableauxState {
        val signTrue = Regex("^\\s*\\\\sign\\s+T:")
        val signAny = Regex("^\\s*\\\\sign\\s+[FT]:")

        val assumption = signTrue.containsMatchIn(formula) // Assumption is true unless '\sign F:' is found
        val baseFormula = formula.replace(signAny, "")
        val startIndex = formula.length - baseFormula.length

        val parsedFormula = ModalLogicParser().parse(baseFormula, startIndex)
        return SignedModalTableauxState(parsedFormula, assumption, params?.backtracking ?: true)
    }

    @Suppress("ComplexMethod")
    override fun applyMoveOnState(
        state: SignedModalTableauxState,
        move: SignedModalTableauxMove,
    ): SignedModalTableauxState {
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
        if (!state.backtracking) {
            throw IllegalMove("Backtracking is not enabled for this proof")
        }
        // Can't undo any more moves in initial state
        if (state.moveHistory.isEmpty()) {
            return state
        }
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

        if (state.tree[0].isClosed) {
            val withWithoutBT = if (state.usedBacktracking) "with" else "without"
            msg = "The proof is closed and valid in signed modal-logic tableaux $withWithoutBT backtracking"
        }

        return CloseMessage(state.tree[0].isClosed, msg)
    }

    override fun stateToJson(state: SignedModalTableauxState): String {
        state.render()
        return super.stateToJson(state)
    }

    /*
     * Parses a JSON parameter representation into a TableauxParam object
     * @param json JSON parameter representation
     * @return parsed param object
     */
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToParam(json: String): SignedModalTableauxParam {
        try {
            return serializer.decodeFromString(json)
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
    @Suppress("MagicNumber")
    override fun scoreFromState(state: SignedModalTableauxState, name: String?): Map<String, String> {
        val multiplier = if (state.usedBacktracking) 0.9 else 1.0
        val score = multiplier * ((1 / sqrt(state.moveHistory.size.toDouble())) * 1000)
        return mapOf(
            "Name" to (name ?: ""),
            "#rules" to state.moveHistory.size.toString(),
            "Depth" to state.getDepth(0).toString(),
            "Branches" to state.getWidth(0).toString(),
            "Backtracked" to if (state.usedBacktracking) "yes" else "no",
            "Score" to score.toInt().toString(),
        )
    }

    override fun formulaFromState(state: SignedModalTableauxState) = state.tree[0].toString()
}
