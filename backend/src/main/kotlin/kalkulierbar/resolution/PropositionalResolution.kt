package kalkulierbar.resolution

import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.clause.ClauseSet
import kalkulierbar.parsers.CnfStrategy
import kalkulierbar.parsers.FlexibleClauseSetParser
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class PropositionalResolution :
        GenericResolution<String>,
        JSONCalculus<ResolutionState, ResolutionMove, ResolutionParam>() {
    override val identifier = "prop-resolution"

    private val serializer = Json(context = resolutionMoveModule)

    override fun parseFormulaToState(formula: String, params: ResolutionParam?): ResolutionState {
        val parsed = if (params == null)
            FlexibleClauseSetParser.parse(formula)
        else
            FlexibleClauseSetParser.parse(formula, params.cnfStrategy)

        return ResolutionState(parsed, params?.highlightSelectable ?: false)
    }

    override fun applyMoveOnState(state: ResolutionState, move: ResolutionMove): ResolutionState {
        when (move) {
            is MoveResolve -> resolve(state, move.c1, move.c2, move.literal)
            is MoveHide -> hide(state, move.c1)
            is MoveShow -> show(state)
            is MoveFactorize -> factorize(state, move.c1)
            else -> throw IllegalMove("Unknown move")
        }
        return state
    }

    /**
     * Applies the factorize move
     * @param state The state to apply the move on
     * @param clauseID Id of clause to apply the move on
     */
    @Suppress("ThrowsCount")
    fun factorize(state: ResolutionState, clauseID: Int) {
        val clauses = state.clauseSet.clauses

        // verify that clause id is valid
        if (clauseID < 0 || clauseID >= clauses.size)
            throw IllegalMove("There is no clause with id $clauseID")
        if (clauses.size == 1)
            throw IllegalMove("Can not factorize clause with 1 element")

        val oldClause = clauses[clauseID]
        // Copy old clause and factorize
        val newClause = oldClause.clone()
        newClause.factorize()

        // Throw message for no possible factorisation
        if (oldClause == newClause)
            throw IllegalMove("Nothing to factorize")

        // Hide old and add new clause
        hide(state, clauseID)
        clauses.add(newClause)
        state.newestNode = clauses.size - 1
    }

    override fun checkCloseOnState(state: ResolutionState) = getCloseMessage(state)

    @Suppress("TooGenericExceptionCaught")
    override fun jsonToState(json: String): ResolutionState {
        try {
            val parsed = serializer.parse(ResolutionState.serializer(), json)

            // Ensure valid, unmodified state object
            if (!parsed.verifySeal())
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

            return parsed
        } catch (e: Exception) {
            val msg = "Could not parse JSON state: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    override fun stateToJson(state: ResolutionState): String {
        state.computeSeal()
        return serializer.stringify(ResolutionState.serializer(), state)
    }

    @Suppress("TooGenericExceptionCaught")
    override fun jsonToMove(json: String): ResolutionMove {
        try {
            return serializer.parse(ResolutionMove.serializer(), json)
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
    override fun jsonToParam(json: String): ResolutionParam {
        try {
            return serializer.parse(ResolutionParam.serializer(), json)
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
    override val hiddenClauses = ClauseSet<String>()

    override var seal = ""

    override fun getHash(): String {
        return "resolutionstate|$clauseSet|$hiddenClauses|$highlightSelectable|$newestNode"
    }
}

@Serializable
data class ResolutionParam(val cnfStrategy: CnfStrategy, val highlightSelectable: Boolean)
