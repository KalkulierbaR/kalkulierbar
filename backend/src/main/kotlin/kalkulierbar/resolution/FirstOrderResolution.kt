package kalkulierbar.resolution

import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.Relation
import kalkulierbar.logic.transform.FirstOrderCNF
import kalkulierbar.logic.transform.VariableSuffixAppend
import kalkulierbar.logic.transform.VariableSuffixStripper
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class FirstOrderResolution :
    GenericResolution<Relation>,
    JSONCalculus<FoResolutionState, ResolutionMove, FoResolutionParam>() {
    override val identifier = "fo-resolution"

    override val serializer = Json {
        serializersModule = resolutionMoveModule + FoTermModule
        encodeDefaults = true
    }
    override val stateSerializer = FoResolutionState.serializer()
    override val moveSerializer = ResolutionMove.serializer()

    override fun parseFormulaToState(formula: String, params: FoResolutionParam?): FoResolutionState {
        val parsed = FirstOrderParser.parse(formula)
        val clauses = FirstOrderCNF.transform(parsed)

        val state = FoResolutionState(clauses, params?.visualHelp ?: VisualHelp.NONE)

        // Distinguish variables in each clause by appending suffixes
        state.initSuffix()

        return state
    }

    override fun applyMoveOnState(state: FoResolutionState, move: ResolutionMove): FoResolutionState {
        // Reset status message
        state.statusMessage = null

        when (move) {
            is MoveResolveUnify -> resolveMove(state, move.c1, move.c2, move.l1, move.l2, null)
            is MoveResolveCustom -> resolveMove(state, move.c1, move.c2, move.l1, move.l2, move.getVarAssignTerms())
            is MoveHide -> state.hide(move.c1)
            is MoveShow -> state.show()
            is MoveHyper -> hyper(state, move.mainID, move.atomMap)
            is MoveFactorize -> factorize(state, move.c1, move.atoms)
            else -> throw IllegalMove("Unknown move type")
        }

        state.lastMove = move

        return state
    }

    override fun checkCloseOnState(state: FoResolutionState) = state.getCloseMessage()

    /*
     * Parses a JSON parameter representation into a ResolutionParam object
     * @param json JSON parameter representation
     * @return parsed param object
     */
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToParam(json: String): FoResolutionParam {
        try {
            return serializer.decodeFromString(json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON params: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }
}

@Serializable
class FoResolutionState(
    override val clauseSet: ClauseSet<Relation>,
    override val visualHelp: VisualHelp,
) : GenericResolutionState<Relation>, ProtectedState() {
    override var newestNode = -1
    override val hiddenClauses = ClauseSet<Relation>()
    var clauseCounter = 0
    var statusMessage: String? = null

    var lastMove: ResolutionMove? = null

    override var seal = ""

    override fun getHash(): String {
        return "resolutionstate|$clauseSet|$hiddenClauses|$visualHelp|$newestNode|$clauseCounter"
    }

    /**
     * Append a unique suffix to the quantified variables in a clause
     * Overwrites existing suffixes
     * @param clauseID ID of the clause to process
     */
    fun setSuffix(clauseID: Int) {
        clauseCounter++
        val clause = clauseSet.clauses[clauseID]
        val stripper = VariableSuffixStripper("_")
        val appender = VariableSuffixAppend("_$clauseCounter")

        for (atom in clause.atoms) {
            atom.lit.arguments = atom.lit.arguments.map { it.accept(stripper).accept(appender) }
        }
    }

    /**
     * Append initial suffixes to all clauses
     */
    fun initSuffix() {
        for (i in clauseSet.clauses.indices)
            setSuffix(i)
    }
}

@Serializable
data class FoResolutionParam(val visualHelp: VisualHelp)
