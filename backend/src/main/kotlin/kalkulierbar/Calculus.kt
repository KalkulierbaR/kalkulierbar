package kalkulierbar

/**
 * Calculus Interface
 *
 * Defines the basic methods each implementing calculus must provide to work with the common API
 *
 * @property identifier Unique (!) name or shorthand of the calculus,
 * used as the API endpoint (i.e. /identifier/parse etc)
 */
interface Calculus {
    val identifier: String

    /**
     * Parses a formula provided as text into a state representation
     * Note that the used format for both the formula and the state may differ for different implementations
     * @param formula logic formula in some given format
     * @param params optional parameters for the calculus
     * @return complete state representation of the input formula
     */
    fun parseFormula(formula: String, params: String?): String

    /**
     * Takes a state representation and evaluates whether it is a valid state
     * @param state The representation of the current state
     * @return string representation of whether or not it is valid
     */
    fun validate(state: String): String

    /**
     * Takes in a state representation and a move and applies the move on the state if possible.
     * Throws an exception explaining why the move is illegal otherwise.
     * @param state state representation of the current (pre-)state
     * @param move move to apply in the given state
     * @return state representation after move was applied
     */
    fun applyMove(state: String, move: String): String

    /**
     * Checks if a given state represents a valid, closed proof.
     * @param state state representation to validate
     * @return string representing proof state (closed/open) with an optional message
     */
    fun checkClose(state: String): String

    /**
     * Calculates the statistics for the given closed state.
     * @param state state representation
     * @return string representing the statistics of the given proof
     */
    fun getStatistics(state: String): String
}
