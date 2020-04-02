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

class PropositionalResolution : GenericResolution<String>,
        JSONCalculus<ResolutionState, ResolutionMove, ResolutionParam>() {
    override val identifier = "prop-resolution"

    private val serializer = Json(context = resolutionMoveModule)

    override fun parseFormulaToState(formula: String, params: ResolutionParam?): ResolutionState {
        val parsed = if (params == null)
            FlexibleClauseSetParser.parse(formula)
        else
            FlexibleClauseSetParser.parse(formula, params.cnfStrategy)

        return ResolutionState(parsed, params?.visualHelp ?: VisualHelp.NONE)
    }

    override fun applyMoveOnState(state: ResolutionState, move: ResolutionMove): ResolutionState {
        when (move) {
            is MoveResolve -> state.resolve(move.c1, move.c2, move.literal)
            is MoveHide -> state.hide(move.c1)
            is MoveShow -> state.show()
            is MoveHyper -> hyper(state, move.mainID, move.atomMap)
            is MoveFactorize -> factorize(state, move.c1)
            else -> throw IllegalMove("Unknown move")
        }
        state.lastMove = move
        return state
    }

    /**
     * Applies the factorize move
     * @param state The state to apply the move on
     * @param clauseID Id of clause to apply the move on
     */
    fun factorize(state: ResolutionState, clauseID: Int) {
        val clauses = state.clauseSet.clauses

        // Verify that clause id is valid
        if (clauseID < 0 || clauseID >= clauses.size)
            throw IllegalMove("There is no clause with id $clauseID")

        val oldClause = clauses[clauseID]
        // Copy old clause and factorize
        val newClause = oldClause.clone()
        newClause.atoms = newClause.atoms.distinct().toMutableList()

        // Throw message for no possible factorisation
        if (oldClause.atoms.size == newClause.atoms.size)
            throw IllegalMove("Nothing to factorize")

        // Hide old and add new clause
        clauses.removeAt(clauseID)
        clauses.add(clauseID, newClause)
        state.newestNode = clauseID
    }

    /**
     * Creates a new clause in which all side premisses are resolved with the main premiss
     * while paying attention to resolving one atom in each side premiss with the main premiss.
     * Adds the result to the clause set
     * @param state Current proof state
     * @param mainID ID of main premiss clause
     * @param atomMap Maps an atom of the main premiss to an atom of a side premiss
     */
    @Suppress("ThrowsCount")
    fun hyper(
        state: ResolutionState,
        mainID: Int,
        atomMap: Map<Int, Pair<Int, Int>>
    ) {
        // Checks for correct clauseID and IDs in Map
        checkHyperID(state, mainID, atomMap)

        if (atomMap.isEmpty())
            throw IllegalMove("Please select side premisses for hyper resolution")

        val clauses = state.clauseSet.clauses
        var mainPremiss = clauses[mainID].clone()

        // Resolves each side premiss with main premiss
        for ((mAtomID, pair) in atomMap) {
            val (sClauseID, sAtomID) = pair
            val sidePremiss = clauses[sClauseID]

            // Check side premiss for positiveness
            if (!sidePremiss.isPositive())
                throw IllegalMove("Side premiss $sidePremiss is not positive")

            val mainAtom = clauses[mainID].atoms[mAtomID]
            val sideAtom = sidePremiss.atoms[sAtomID]
            // Check that atom in main premiss is negative
            if (!mainAtom.negated)
                throw IllegalMove("Literal '$mainAtom' in main premiss has to be negative, ")

            // Resolve mainPremiss and sidePremiss
            mainPremiss = buildClause(mainPremiss, mainAtom, sidePremiss, sideAtom)
        }

        // Check there are no negative atoms anymore
        if (!mainPremiss.isPositive())
            throw IllegalMove("Resulting clause $mainPremiss is not positive")

        // Add resolved clause to clause set
        clauses.add(mainPremiss)
        state.newestNode = clauses.size - 1
    }

    override fun checkCloseOnState(state: ResolutionState) = state.getCloseMessage()

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
    override val visualHelp: VisualHelp
) : GenericResolutionState<String>, ProtectedState() {
    override var newestNode = -1
    override val hiddenClauses = ClauseSet<String>()

    var lastMove: ResolutionMove? = null

    override var seal = ""

    override fun getHash(): String {
        return "resolutionstate|$clauseSet|$hiddenClauses|$visualHelp|$newestNode"
    }
}

@Serializable
data class ResolutionParam(val cnfStrategy: CnfStrategy, val visualHelp: VisualHelp)
