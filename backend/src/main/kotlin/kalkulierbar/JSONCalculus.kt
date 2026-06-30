package kalkulierbar

import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/**
 * Framework for Calculus implementations using JSON for serialization
 * Handles serialization and deserialization, letting implementing classes work directly on state
 */
@Suppress("TooManyFunctions")
abstract class JSONCalculus<State, Move, Param> : Calculus {
    protected abstract val serializer: Json
    protected abstract val moveSerializer: KSerializer<Move>
    protected abstract val stateSerializer: KSerializer<State>

    /**
     * Parses a formula provided as text into a state representation
     * Note that the used format for both the formula and the state may differ for different implementations
     * @param formula logic formula in some given format
     * @param params optional parameters for the calculus
     * @return complete state representation of the input formula
     */
    override fun parseFormula(
        formula: String,
        params: String?,
    ): String {
        val paramsObj = if (params == null) null else jsonToParam(params)
        return stateToJson(parseFormulaToState(formula, paramsObj))
    }

    /**
     * Parses a formula provided as text into an internal state
     * @param formula logic formula in some given format
     * @return parsed state object
     */
    abstract fun parseFormulaToState(
        formula: String,
        params: Param?,
    ): State

    override fun validate(state: String): String {
        val stateObj = jsonToState(state)
        return if (validateOnState(stateObj)) "true" else "false"
    }

    /**
     * Takes a state and evaluates whether it is valid
     * @param state The current state
     * @return Whether it is valid
     */
    open fun validateOnState(state: State): Boolean = true

    /**
     * Takes in a state representation and a move and applies the move on the state if possible.
     * Throws an exception explaining why the move is illegal otherwise.
     * @param state state representation of the current (pre-)state
     * @param move move to apply in the given state
     * @return state representation after move was applied
     */
    override fun applyMove(
        state: String,
        move: String,
    ): String {
        val stateObj = jsonToState(state)
        val moveObj = jsonToMove(move)
        return stateToJson(applyMoveOnState(stateObj, moveObj))
    }

    /**
     * Takes in a state object and a move and applies the move to the state if possible
     * Throws an exception explaining why the move is illegal otherwise
     * @param state current state object
     * @param move move to apply in the given state
     * @return state after the move was applied
     */
    abstract fun applyMoveOnState(
        state: State,
        move: Move,
    ): State

    /**
     * Checks if a given state represents a valid, closed proof.
     * @param state state representation to validate
     * @return string representing proof state (closed/open) with an optional message
     */
    override fun checkClose(state: String) = closeToJson(checkCloseOnState(jsonToState(state)))

    /**
     * Checks if a given state represents a valid, closed proof.
     * @param state state object to validate
     * @return string representing proof state (closed/open) with an optional message
     */
    abstract fun checkCloseOnState(state: State): CloseMessage

    /**
     * Parses a JSON state representation into a State object
     * @param json JSON state representation
     * @return parsed state object
     */
    @Suppress("TooGenericExceptionCaught")
    open fun jsonToState(json: String): State {
        try {
            val parsed: State = serializer.decodeFromString(stateSerializer, json)

            // Ensure valid, unmodified state object
            if (parsed is ProtectedState && !parsed.verifySeal()) {
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")
            }
            return parsed
        } catch (e: Exception) {
            val msg = "Could not parse JSON state: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    /**
     * Serializes a state object to JSON
     * @param state State object
     * @return JSON state representation
     */
    open fun stateToJson(state: State): String {
        if (state is ProtectedState) {
            state.computeSeal()
        }
        return serializer.encodeToString(stateSerializer, state)
    }

    /**
     * Parses a JSON move representation into a Move object
     * @param json JSON move representation
     * @return parsed move object
     */
    @Suppress("TooGenericExceptionCaught")
    open fun jsonToMove(json: String): Move {
        try {
            return serializer.decodeFromString(moveSerializer, json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON move: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    /**
     * Parses a JSON parameter representation into a Param object
     * @param json JSON parameter representation
     * @return parsed param object
     */
    abstract fun jsonToParam(json: String): Param

    /**
     * Serializes a close message to JSON
     * @param close CloseMessage object to serialize
     * @return JSON close message
     */
    fun closeToJson(close: CloseMessage) = Json.encodeToString(CloseMessage.serializer(), close)
}

@Serializable
data class CloseMessage(
    val closed: Boolean,
    val msg: String,
)
