package kalkulierbar

import kalkulierbar.clause.ClauseSet
import kalkulierbar.parsers.ClauseSetParser
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonDecodingException

/**
 * Framework for Calculus implementations using JSON for serialization
 * Handles serialization and deserialization, letting implementing classes work directly on state
 */
class PropositionalTableaux : JSONCalculus<TableauxState>() {

    override val identifier = "prop-tableaux"

    /**
     * Parses a formula provided as text into an internal state
     * @param formula logic formula in some given format
     * @return parsed state object
     */
    override fun parseFormulaToState(formula: String): TableauxState {
        val clauses = ClauseSetParser.parse(formula)
        return TableauxState(clauses)
    }

    /**
     * Takes in a state object and a move and applies the move to the state if possible
     * Throws an exception explaining why the move is illegal otherwise
     * @param state current state object
     * @param move move to apply in the given state
     * @return state after the move was applied
     */
    override fun applyMoveOnState(state: TableauxState, move: String) = state

    /**
     * Checks if a given state represents a valid, closed proof.
     * @param state state object to validate
     * @return true if the given proof is closed and valid, false otherwise
     */
    override fun checkCloseOnState(state: TableauxState) = false

    /**
     * Parses a JSON state representation into a State object
     * @param json JSON state representation
     * @return parsed state object
     */
    @kotlinx.serialization.UnstableDefault
    override fun jsonToState(json: String): TableauxState {
        try {
            return Json.parse(TableauxState.serializer(), json)
        } catch (e: JsonDecodingException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state")
        }
    }

    /**
     * Serializes a state object to JSON
     * @param state State object
     * @return JSON state representation
     */
    @kotlinx.serialization.UnstableDefault
    override fun stateToJson(state: TableauxState) = Json.stringify(TableauxState.serializer(), state)
}

@Serializable
class TableauxState(val clauseSet: ClauseSet) {
    var idCounter = 0
    val nodes = mutableListOf<TableauxNode>(TableauxNode(0, "true", false))
}

@Serializable
class TableauxNode(val parent: Int, val spelling: String, val negated: Boolean) {
    var isLeaf = true
    var isClosed = false
    val children = mutableListOf<Int>()
}
