package kalkulierbar.resolution

import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.UnificationImpossible
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.Relation
import kalkulierbar.logic.transform.FirstOrderCNF
import kalkulierbar.logic.transform.Unification
import kalkulierbar.logic.transform.VariableInstantiator
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class FirstOrderResolution : GenericResolution<Relation>, JSONCalculus<FoResolutionState, ResolutionMove, FoResolutionParam>() {
    override val identifier = "fo-resolution"

    private val serializer = Json(context = resolutionMoveModule + FoTermModule)

    override fun parseFormulaToState(formula: String, params: FoResolutionParam?): FoResolutionState {
        val parsed = FirstOrderParser.parse(formula)
        val clauses = FirstOrderCNF.transform(parsed)

        return FoResolutionState(clauses, params?.highlightSelectable ?: false)
    }

    override fun applyMoveOnState(state: FoResolutionState, move: ResolutionMove): FoResolutionState {
        when (move) {
            is MoveResolveUnify -> resolveUnify(state, move.c1, move.c2, move.l1, move.l2)
            is MoveInstantiate -> instantiate(state, move.c1, move.getVarAssignTerms())
            is MoveHide -> hide(state, move.c1)
            is MoveShow -> show(state)
            else -> throw IllegalMove("Unknown move type")
        }

        return state
    }

    override fun checkCloseOnState(state: FoResolutionState) = getCloseMessage(state)

    @Suppress("ThrowsCount")
    private fun resolveUnify(state: FoResolutionState, c1: Int, c2: Int, c1lit: Int, c2lit: Int) {
        if (c1 < 0 || c1 >= state.clauseSet.clauses.size)
            throw IllegalMove("There is no clause with id $c1")
        if (c2 < 0 || c2 >= state.clauseSet.clauses.size)
            throw IllegalMove("There is no clause with id $c1")

        val clause1 = state.clauseSet.clauses[c1]
        val clause2 = state.clauseSet.clauses[c2]

        if (c1lit < 0 || c1lit >= clause1.atoms.size)
            throw IllegalMove("Clause $clause1 has no atom with index $c1lit")
        if (c2lit < 0 || c2lit >= clause2.atoms.size)
            throw IllegalMove("Clause $clause2 has no atom with index $c2lit")

        val literal1 = clause1.atoms[c1lit].lit
        val literal2 = clause2.atoms[c2lit].lit
        val mgu: Map<String, FirstOrderTerm>

        try {
            mgu = Unification.unify(literal1, literal2)
        } catch (e: UnificationImpossible) {
            throw IllegalMove("Could not unify '$literal1' and '$literal2': ${e.message}")
        }

        instantiate(state, c1, mgu)
        val instance1 = state.clauseSet.clauses.size - 1
        instantiate(state, c2, mgu)
        val instance2 = state.clauseSet.clauses.size - 1
        val literal = state.clauseSet.clauses[instance1].atoms[c1lit].lit

        resolve(state, instance1, instance2, literal)
        // TODO these indices arent always correct (also set newest node pointer)
        // hide(state, instance2)
        // hide(state, instance1)
    }

    /**
     * Create a new clause by applying a variable instantiation on an existing clause
     * @param state Current proof state
     * @param clauseID ID of the clause to use for instantiation
     * @param varAssign Map of Variables and terms they are instantiated with
     */
    private fun instantiate(
        state: FoResolutionState,
        clauseID: Int,
        varAssign: Map<String, FirstOrderTerm>
    ) {
        if (clauseID < 0 || clauseID >= state.clauseSet.clauses.size)
            throw IllegalMove("There is no clause with id $clauseID")

        val baseClause = state.clauseSet.clauses[clauseID]
        val newClause = Clause<Relation>()

        val instantiator = VariableInstantiator(varAssign)

        // Build the new clause by cloning atoms from the base clause and applying instantiation
        baseClause.atoms.forEach {
            val relationArgs = it.lit.arguments.map { it.clone().accept(instantiator) }
            val newRelation = Relation(it.lit.spelling, relationArgs)
            val newAtom = Atom<Relation>(newRelation, it.negated)
            newClause.add(newAtom)
        }

        // Add new clause to state and update newestNode pointer
        state.clauseSet.add(newClause)
        state.newestNode = state.clauseSet.clauses.size - 1
    }

    @Suppress("TooGenericExceptionCaught")
    override fun jsonToState(json: String): FoResolutionState {
        try {
            val parsed = serializer.parse(FoResolutionState.serializer(), json)

            // Ensure valid, unmodified state object
            if (!parsed.verifySeal())
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

            return parsed
        } catch (e: Exception) {
            val msg = "Could not parse JSON state: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    override fun stateToJson(state: FoResolutionState): String {
        state.computeSeal()
        return serializer.stringify(FoResolutionState.serializer(), state)
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
    override fun jsonToParam(json: String): FoResolutionParam {
        try {
            return serializer.parse(FoResolutionParam.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON params: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }
}

@Serializable
class FoResolutionState(
    override val clauseSet: ClauseSet<Relation>,
    override val highlightSelectable: Boolean
) : GenericResolutionState<Relation>, ProtectedState() {
    override var newestNode = -1
    override val hiddenClauses = ClauseSet<Relation>()

    override var seal = ""

    override fun getHash(): String {
        return "resolutionstate|$clauseSet|$hiddenClauses|$highlightSelectable|$newestNode"
    }
}

@Serializable
data class FoResolutionParam(val highlightSelectable: Boolean)
