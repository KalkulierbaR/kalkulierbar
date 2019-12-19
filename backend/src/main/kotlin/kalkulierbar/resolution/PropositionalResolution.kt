package main.kotlin.kalkulierbar.resolution

import kalkulierbar.CloseMessage
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.TamperProtect
import kalkulierbar.clause.ClauseSet
import kalkulierbar.parsers.ClauseSetParser
import kotlinx.serialization.MissingFieldException
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import kotlinx.serialization.UnstableDefault
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonDecodingException

class PropositionalResolution : JSONCalculus<ResolutionState, ResolutionMove, Any>() {
    override val identifier = "prop-resolution"

    override fun parseFormulaToState(formula: String, params: Any?): ResolutionState {
        val parsed = ClauseSetParser.parse(formula)
        return ResolutionState(parsed)
    }

    override fun applyMoveOnState(state: ResolutionState, move: ResolutionMove): ResolutionState {
        TODO("not implemented") // To change body of created functions use File | Settings | File Templates.
    }

    override fun checkCloseOnState(state: ResolutionState): CloseMessage {
        val hasEmptyClause = state.clauseSet.clauses.any { it.atoms.isEmpty() }
        return CloseMessage(hasEmptyClause, "The proof is closed.")
    }

    @UnstableDefault
    override fun jsonToState(json: String): ResolutionState {
        try {
            val parsed = Json.parse(ResolutionState.serializer(), json)

            // Ensure valid, unmodified state object
            if (!parsed.verifySeal())
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

            return parsed
        } catch (e: JsonDecodingException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state")
        } catch (e: MissingFieldException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state - missing field")
        } catch (e: SerializationException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state")
        } catch (e: NumberFormatException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state - invalid number format")
        }
    }

    @UnstableDefault
    override fun stateToJson(state: ResolutionState): String {
        state.computeSeal()
        return Json.stringify(ResolutionState.serializer(), state)
    }

    @UnstableDefault
    override fun jsonToMove(json: String): ResolutionMove {
        try {
            return Json.parse(ResolutionMove.serializer(), json)
        } catch (e: JsonDecodingException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move")
        } catch (e: MissingFieldException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move - missing field")
        } catch (e: SerializationException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move")
        } catch (e: NumberFormatException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move - invalid number format")
        }
    }

    override fun jsonToParam(json: String): Any {
        return 0
    }
}

@Serializable
class ResolutionState(val clauseSet: ClauseSet) {
    var seal = ""

    /**
     * Generate a checksum of the current state to detect state objects being
     * modified or corrupted while in transit
     * Call before exporting state
     */
    fun computeSeal() {
        val payload = getHash()
        seal = TamperProtect.seal(payload)
    }

    /**
     * Verify the state object checksum
     * Call after importing state
     * @return true iff the current seal is valid
     */
    fun verifySeal() = TamperProtect.verify(getHash(), seal)

    /**
    * Pack the state into a well-defined, unambiguous string representation
    * Used to calculate checksums over state objects as JSON representation
    * might differ slightly between clients, encodings, etc
    * @return Canonical state representation
    */
    fun getHash(): String {
        val clauseSetHash = clauseSet.toString()
        return "resolutionstate|$clauseSetHash"
    }
}

@Serializable
data class ResolutionMove(val c1: Int, val c2: Int)
