package kalkulierbar

/**
 * Calculus Interface
 *
 * Defines the basic methods each implementing calculus must provide to work with the common API
 *
 * @property identifier Unique (!) name or shorthand of the calculus, used as the API endpoint (i.e. /identifier/parse etc)
 */
interface Calculus {
    val identifier: String

    /**
	 * Parses a formula provided as text into a state representation
	 * Note that the used format for both the formula and the state may differ for different implementations
	 * @param formula logic formula in some given format
	 * @return complete state representation of the input formula
	 */
    fun parseFormula(formula: String): String

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
	 * @return true if the given proof is closed and valid, false otherwise
	 */
    fun checkClose(state: String): Boolean

    /**
	 * Provides some API documentation regarding formats used for inputs and outputs, implementation specific
	 * @return plaintext API documentation
	 */
    fun getDocumentation(): String {
        return "[no documentation available for this calculus]"
    }
}
