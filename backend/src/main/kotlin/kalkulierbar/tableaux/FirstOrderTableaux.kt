package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.Relation
import kalkulierbar.logic.transform.FirstOrderCNF
import kalkulierbar.parsers.FirstOrderParser
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

@Suppress("TooManyFunctions")
class FirstOrderTableaux : GenericTableaux<Relation>, JSONCalculus<FoTableauxState, TableauxMove, FoTableauxParam>() {

    override val identifier = "fo-tableaux"

    override val serializer = Json {
        serializersModule = FoTermModule + tableauxMoveModule
        encodeDefaults = true
    }
    override val stateSerializer = FoTableauxState.serializer()
    override val moveSerializer = TableauxMove.serializer()

    override fun parseFormulaToState(formula: String, params: FoTableauxParam?): FoTableauxState {
        val clauses = FirstOrderCNF.transform(FirstOrderParser.parse(formula))

        if (params == null)
            return FoTableauxState(clauses, formula)

        return FoTableauxState(
            clauses,
            formula,
            params.type,
            params.regular,
            params.backtracking,
            params.manualVarAssign
        )
    }

    override fun applyMoveOnState(state: FoTableauxState, move: TableauxMove): FoTableauxState {
        // Reset status message
        state.statusMessage = null

        // Pass moves to relevant subfunction
        return when (move) {
            is MoveAutoClose -> applyAutoCloseBranch(state, move.id1, move.id2)
            is MoveCloseAssign -> applyMoveCloseBranch(state, move.id1, move.id2, move.getVarAssignTerms())
            is MoveExpand -> applyMoveExpandLeaf(state, move.id1, move.id2)
            is MoveLemma -> applyMoveUseLemma(state, move.id1, move.id2)
            is MoveUndo -> applyMoveUndo(state)
            else -> throw IllegalMove("Unknown Move")
        }
    }

    /**
     * Undo a rule application by re-building the state from the move history
     * @param state State in which to apply the undo
     * @return Equivalent state with the most recent rule application removed
     */
    private fun applyMoveUndo(state: FoTableauxState): FoTableauxState {
        if (!state.backtracking)
            throw IllegalMove("Backtracking is not enabled for this proof")

        // Can't undo any more moves in initial state
        if (state.moveHistory.isEmpty())
            return state

        // Create a fresh clone-state with the same parameters and input formula
        val params = FoTableauxParam(state.type, state.regular, state.backtracking, state.manualVarAssign)
        var freshState = parseFormulaToState(state.formula, params)
        freshState.usedBacktracking = true

        // We don't want to re-do the last move
        state.moveHistory.removeAt(state.moveHistory.size - 1)

        // Re-build the proof tree in the clone state
        state.moveHistory.forEach {
            freshState = applyMoveOnState(freshState, it)
        }

        return freshState
    }

    override fun checkCloseOnState(state: FoTableauxState) = state.getCloseMessage()

    override fun stateToJson(state: FoTableauxState): String {
        state.render()
        return super.stateToJson(state)
    }

    /*
     * Parses a JSON parameter representation into a TableauxParam object
     * @param json JSON parameter representation
     * @return parsed param object
     */
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToParam(json: String): FoTableauxParam {
        try {
            return serializer.decodeFromString(json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON params"
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }
}
