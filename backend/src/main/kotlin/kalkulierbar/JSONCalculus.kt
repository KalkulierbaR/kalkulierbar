package kalkulierbar

import main.kotlin.kalkulierbar.Calculus

/**
 * Calculus Interface
 *
 * Defines the basic methods each implementing calculus must provide to work with the common API
 *
 * @property identifier Unique (!) name or shorthand of the calculus, used as the API endpoint (i.e. /identifier/parse etc)
 */
abstract class JSONCalculus<State> : Calculus {

    /**
     * Parses a formula provided as text into a state representation
     * Note that the used format for both the formula and the state may differ for different implementations
     * @param formula logic formula in some given format
     * @return complete state representation of the input formula
     */
    override fun parseFormula(formula: String) = stateToJson(parseFormulaToState(formula))

    abstract fun parseFormulaToState(formula: String): State

    /**
     * Takes in a state representation and a move and applies the move on the state if possible.
     * Throws an exception explaining why the move is illegal otherwise.
     * @param state state representation of the current (pre-)state
     * @param move move to apply in the given state
     * @return state representation after move was applied
     */
    override fun applyMove(json: String, move: String) = stateToJson(applyMoveOnState(jsonToState(json), move))

    abstract fun applyMoveOnState(state: State, move: String): State

    /**
     * Checks if a given state represents a valid, closed proof.
     * @param state state representation to validate
     * @return true if the given proof is closed and valid, false otherwise
     */
    override fun checkClose(json: String) = checkCloseOnState(jsonToState(json))

    abstract fun checkCloseOnState(state: State): Boolean

    abstract fun jsonToState(json: String): State

    abstract fun stateToJson(state: State): String
}
