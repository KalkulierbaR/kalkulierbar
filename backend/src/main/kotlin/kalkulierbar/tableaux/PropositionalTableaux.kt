package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.parsers.FlexibleClauseSetParser
import kotlinx.serialization.json.Json

/**
 * Implementation of a simple tableaux calculus on propositional clause sets
 * For calculus specification see docs/PropositionalTableaux.md
 */
@Suppress("TooManyFunctions")
class PropositionalTableaux : GenericTableaux<String>, JSONCalculus<TableauxState, TableauxMove, TableauxParam>() {

    override val identifier = "prop-tableaux"

    private val serializer = Json(context = tableauxMoveModule)

    /**
     * Parses a provided clause set as text into an initial internal state
     * Resulting state object will have a root node labeled 'true' in its tree
     * @param formula propositional clause set, format a,!b;!c,d
     * @return parsed state object
     */
    override fun parseFormulaToState(formula: String, params: TableauxParam?): TableauxState {
        if (params == null) {
            val clauses = FlexibleClauseSetParser.parse(formula)
            return TableauxState(clauses)
        } else {
            val clauses = FlexibleClauseSetParser.parse(formula, params.cnfStrategy)
            return TableauxState(clauses, params.type, params.regular, params.backtracking)
        }
    }

    /**
     * Takes in a state object and a move and applies the move to the state if possible
     * Throws an exception explaining why the move is illegal otherwise
     * @param state current state object
     * @param move move to apply in the given state
     * @return state after the move was applied
     */
    @Suppress("ReturnCount")
    override fun applyMoveOnState(state: TableauxState, move: TableauxMove): TableauxState {
        // Pass expand, close, undo moves to relevant subfunction
        return when (move) {
            is MoveAutoClose -> applyMoveCloseBranch(state, move.id1, move.id2)
            is MoveExpand -> applyMoveExpandLeaf(state, move.id1, move.id2)
            is MoveLemma -> applyMoveUseLemma(state, move.id1, move.id2)
            is MoveUndo -> applyMoveUndo(state)
            else -> throw IllegalMove("Unknown move")
        }
    }

    /**
     * Checks if a given state represents a valid, closed proof.
     * @param state state object to validate
     * @return string representing proof closed state (true/false)
     */
    override fun checkCloseOnState(state: TableauxState) = state.getCloseMessage()

    /**
     * Parses a JSON state representation into a TableauxState object
     * @param json JSON state representation
     * @return parsed state object
     */
    @Suppress("TooGenericExceptionCaught")
    @kotlinx.serialization.UnstableDefault
    override fun jsonToState(json: String): TableauxState {
        try {
            val parsed = serializer.parse(TableauxState.serializer(), json)

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
    @kotlinx.serialization.UnstableDefault
    override fun stateToJson(state: TableauxState): String {
        state.computeSeal()
        return serializer.stringify(TableauxState.serializer(), state)
    }

    /*
     * Parses a JSON move representation into a TableauxMove object
     * @param json JSON move representation
     * @return parsed move object
     */
    @Suppress("TooGenericExceptionCaught")
    @kotlinx.serialization.UnstableDefault
    override fun jsonToMove(json: String): TableauxMove {
        try {
            return serializer.parse(TableauxMove.serializer(), json)
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
    @kotlinx.serialization.UnstableDefault
    override fun jsonToParam(json: String): TableauxParam {
        try {
            return serializer.parse(TableauxParam.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON params: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }
}
