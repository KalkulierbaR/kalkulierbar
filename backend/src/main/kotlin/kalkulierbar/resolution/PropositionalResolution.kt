package kalkulierbar.resolution

import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.clause.ClauseSet
import kalkulierbar.parsers.CnfStrategy
import kalkulierbar.parsers.FlexibleClauseSetParser
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable
import kotlinx.serialization.UnstableDefault
import kotlinx.serialization.json.Json

class PropositionalResolution : GenericResolution<String>, JSONCalculus<ResolutionState, ResolutionMove, ResolutionParam>() {
    override val identifier = "prop-resolution"

    override fun parseFormulaToState(formula: String, params: ResolutionParam?): ResolutionState {
        val parsed = if (params == null)
            FlexibleClauseSetParser.parse(formula)
        else
            FlexibleClauseSetParser.parse(formula, params.cnfStrategy)

        return ResolutionState(parsed, params?.highlightSelectable ?: false)
    }

    override fun applyMoveOnState(state: ResolutionState, move: ResolutionMove): ResolutionState {
        resolve(state, move.c1, move.c2, move.spelling)
        return state
    }

    override fun checkCloseOnState(state: ResolutionState) = getCloseMessage(state)

    @Suppress("TooGenericExceptionCaught")
    @UnstableDefault
    override fun jsonToState(json: String): ResolutionState {
        try {
            val parsed = Json.parse(ResolutionState.serializer(), json)

            // Ensure valid, unmodified state object
            if (!parsed.verifySeal())
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

            return parsed
        } catch (e: Exception) {
            val msg = "Could not parse JSON state: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    @UnstableDefault
    override fun stateToJson(state: ResolutionState): String {
        state.computeSeal()
        return Json.stringify(ResolutionState.serializer(), state)
    }

    @Suppress("TooGenericExceptionCaught")
    @UnstableDefault
    override fun jsonToMove(json: String): ResolutionMove {
        try {
            return Json.parse(ResolutionMove.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON move: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    /*
     * Parses a JSON parameter representation into a ResolutionParam object
     * @param json JSON parameter representation
     * @return parsed param object
     */
    @Suppress("TooGenericExceptionCaught")
    @UnstableDefault
    override fun jsonToParam(json: String): ResolutionParam {
        try {
            return Json.parse(ResolutionParam.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON params: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }
}

@Serializable
class ResolutionState(
    override val clauseSet: ClauseSet<String>,
    override val highlightSelectable: Boolean
) : GenericResolutionState<String>, ProtectedState() {
    override var newestNode = -1

    override var seal = ""

    override fun getHash(): String {
        val clauseSetHash = clauseSet.toString()
        return "resolutionstate|$clauseSetHash|$highlightSelectable|$newestNode"
    }
}

@Serializable
data class ResolutionMove(val c1: Int, val c2: Int, val spelling: String?)

@Serializable
data class ResolutionParam(val cnfStrategy: CnfStrategy, val highlightSelectable: Boolean)
