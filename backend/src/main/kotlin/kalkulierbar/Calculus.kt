package kalkulierbar

import main.kotlin.kalkulierbar.CalculusJSON
import main.kotlin.kalkulierbar.JSONSerializable

/**
 * Calculus Interface
 *
 * Defines the basic methods each implementing calculus must provide to work with the common API
 *
 * @property identifier Unique (!) name or shorthand of the calculus, used as the API endpoint (i.e. /identifier/parse etc)
 */
abstract class Calculus<State : JSONSerializable> : CalculusJSON {

    /**
     * Parses a formula provided as text into a state representation
     * Note that the used format for both the formula and the state may differ for different implementations
     * @param formula logic formula in some given format
     * @return complete state representation of the input formula
     */
    abstract fun parseFormula(formula: String): State

    override fun parseFormulaToJSON(formula: String) = parseFormula(formula).toJSON()

    /**
     * Takes in a state representation and a move and applies the move on the state if possible.
     * Throws an exception explaining why the move is illegal otherwise.
     * @param state state representation of the current (pre-)state
     * @param move move to apply in the given state
     * @return state representation after move was applied
     */
    abstract fun applyMove(state: State, move: String): State

    override fun applyMove(state: String, move: String): String {
		val internalState = fromJSON(state)
		return applyMove(internalState, move).toJSON()
    }

    /**
     * Checks if a given state represents a valid, closed proof.
     * @param state state representation to validate
     * @return true if the given proof is closed and valid, false otherwise
     */
    abstract fun checkClose(state: State): Boolean

	override fun checkClose(state: String) = checkClose(fromJSON(state))

    abstract fun fromJSON(state: String): State
}
