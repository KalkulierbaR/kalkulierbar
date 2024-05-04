package kalkulierbar

import kotlinx.serialization.Serializable

abstract class ScoredCalculus<State, Move, Param> : JSONCalculus<State, Move, Param>() {
    /**
     * Calculates the score for a given proof
     * @param state A closed state
     * @param name the name of the user
     * @return The score for the given state
     */
    abstract fun scoreFromState(state: State, name: String?): Map<String, String>

    /**
     * Returns the initial formula of the state.
     * @param state state representation
     * @return string representing the initial formula of the state
     */
    abstract fun formulaFromState(state: State): String

    /**
     * Calculates the score for a given proof
     * @param json A closed state in JSON representation
     * @param name the name of the user
     * @return The score for the given state
     */
    fun getScore(json: String, name: String?): Map<String, String> {
        val state = jsonToState(json)
        if (!checkCloseOnState(state).closed) {
            throw IllegalMove("Cannot get score for unclosed proof")
        }
        return scoreFromState(state, name)
    }

    /**
     * Returns the initial formula of the state.
     * @param json state representation
     * @return string representing the initial formula of the state
     */
    fun getStartingFormula(json: String) = formulaFromState(jsonToState(json))
}

@Serializable
data class Scores(
    val entries: List<Map<String, String>>,
) {
    val keys = if (entries.isEmpty()) emptyList() else entries[0].keys.toList()
}
