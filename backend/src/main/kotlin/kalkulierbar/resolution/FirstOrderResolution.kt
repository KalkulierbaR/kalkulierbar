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
import kalkulierbar.logic.transform.VariableInstantiator
import kalkulierbar.logic.transform.VariableSuffixAppend
import kalkulierbar.logic.transform.VariableSuffixStripper
import kalkulierbar.logic.util.Unification
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

@Suppress("TooManyFunctions")
class FirstOrderResolution :
        GenericResolution<Relation>,
        JSONCalculus<FoResolutionState, ResolutionMove, FoResolutionParam>() {
    override val identifier = "fo-resolution"

    private val serializer = Json(context = resolutionMoveModule + FoTermModule)

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
            is MoveHide -> hide(state, move.c1)
            is MoveShow -> show(state)
            is MoveHyper -> hyper(state, move.mainID, move.atomMap)
            is MoveFactorize -> factorize(state, move.c1, move.atoms)
            else -> throw IllegalMove("Unknown move type")
        }

        return state
    }

    override fun checkCloseOnState(state: FoResolutionState) = getCloseMessage(state)

    @Suppress("ThrowsCount", "LongParameterList")
    /**
     * Resolve two clauses by unifying two literals by a given variable assignment or automatically
     * @param state Current proof state
     * @param c1 Id of first clause
     * @param c2 Id of second clause
     * @param c1lit The literal to unify of the first clause
     * @param c2lit The literal to unify of the second clause
     * @param varAssign Variable assignment to be used
     */
    private fun resolveMove(
        state: FoResolutionState,
        c1: Int,
        c2: Int,
        c1lit: Int,
        c2lit: Int,
        varAssign: Map<String, FirstOrderTerm>?
    ) {
        resolveCheckID(state, c1, c2, c1lit, c2lit)

        val clause1 = state.clauseSet.clauses[c1]
        val clause2 = state.clauseSet.clauses[c2]
        val literal1 = clause1.atoms[c1lit].lit
        val literal2 = clause2.atoms[c2lit].lit
        var unifier = varAssign

        // Calculate mgu if no varAssign was given
        if (unifier == null) {
            try {
                unifier = Unification.unify(literal1, literal2)
            } catch (e: UnificationImpossible) {
                throw IllegalMove("Could not unify '$literal1' and '$literal2': ${e.message}")
            }
        } // Else check varAssign == mgu
        else {
            try {
                // checks both variants because unify is not symmetric
                val mgu1 = Unification.unify(literal1, literal2)
                val mgu2 = Unification.unify(literal2, literal1)
                // Truncate map elements where same elements are in key and value (X_1 -> X_1)
                // Check for mgu == varAssign
                val notMGU1 = unifier.filter { it.key != it.value.toString() }.any { !it.value.synEq(mgu1[it.key]) }
                val notMGU2 = unifier.filter { it.key != it.value.toString() }.any { !it.value.synEq(mgu2[it.key]) }
                if (notMGU1 && notMGU2)
                    state.statusMessage = "Given variable assignment does not equal mgu: $mgu1 or $mgu2"
            } catch (e: UnificationImpossible) {
                // Resolve move will fail in resolve with better error message
            }
        }
        instantiate(state, c1, unifier)
        val instance1 = state.clauseSet.clauses.size - 1
        instantiate(state, c2, unifier)
        val instance2 = state.clauseSet.clauses.size - 1
        val literal = state.clauseSet.clauses[instance1].atoms[c1lit].lit

        resolve(state, instance1, instance2, literal, true)

        // We'll remove the clause instances used for resolution here
        // Technically, we could leave them in an hide them, but this causes unnecessary
        // amounts of clutter in the hidden clause set
        state.clauseSet.clauses.removeAt(instance2)
        state.clauseSet.clauses.removeAt(instance1)

        state.setSuffix(state.clauseSet.clauses.size - 1) // Re-name variables
        state.newestNode = state.clauseSet.clauses.size - 1
    }

    @Suppress("ThrowsCount")
    private fun resolveCheckID(state: FoResolutionState, c1: Int, c2: Int, c1lit: Int, c2lit: Int) {
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
        val newClause = instantiateReturn(baseClause, varAssign)

        // Add new clause to state and update newestNode pointer
        state.clauseSet.add(newClause)
        state.newestNode = state.clauseSet.clauses.size - 1
    }

    /**
     * Create a new clause by applying a variable instantiation on an existing clause
     * @param baseClause the clause to use for instantiation
     * @param varAssign Map of Variables and terms they are instantiated with
     * @return Instantiated clause
     */
    private fun instantiateReturn(
        baseClause: Clause<Relation>,
        varAssign: Map<String, FirstOrderTerm>
    ): Clause<Relation> {
        val newClause = Clause<Relation>()
        val instantiator = VariableInstantiator(varAssign)

        // Build the new clause by cloning atoms from the base clause and applying instantiation
        baseClause.atoms.forEach {
            val relationArgs = it.lit.arguments.map { it.clone().accept(instantiator) }
            val newRelation = Relation(it.lit.spelling, relationArgs)
            val newAtom = Atom<Relation>(newRelation, it.negated)
            newClause.add(newAtom)
        }
        return newClause
    }

    /**
     * Applies the factorize move
     * @param state The state to apply the move on
     * @param clauseID Id of clause to apply the move on
     * @param atoms List of IDs of literals for unification (The literals should be equal)
     */
    @Suppress("ThrowsCount")
    private fun factorize(state: FoResolutionState, clauseID: Int, atomIDs: List<Int>) {
        val clauses = state.clauseSet.clauses

        // Verify that clause id is valid
        if (clauseID < 0 || clauseID >= clauses.size)
            throw IllegalMove("There is no clause with id $clauseID")
        if (atomIDs.size < 2)
            throw IllegalMove("Please select more than 1 atom to factorize")
        // Verification of correct ID in atoms -> unifySingleClause

        var newClause = clauses[clauseID].clone()
        // Unify doubled atoms and remove all except one
        for (i in atomIDs.indices) {
            if (i < atomIDs.size - 1) {
                val firstID = atomIDs[i]
                val secondID = atomIDs[i + 1]
                // Unify the selected atoms and instantiate clause
                val mgu = unifySingleClause(clauses[clauseID], firstID, secondID)
                newClause = instantiateReturn(newClause, mgu)

                // Check equality of both atoms
                if (newClause.atoms[firstID] != newClause.atoms[secondID])
                    throw IllegalMove("Atom '${newClause.atoms[firstID]}' and '${newClause.atoms[secondID]}'" +
                        " are not equal after instantiation")

                // Change every unified atom to placeholder (except last) -> later remove all placeholder
                // -> One Atom remains
                newClause.atoms[atomIDs[i]] = Atom<Relation>(Relation("%placeholder%", mutableListOf()), false)
            }
        }
        // Remove placeholder atoms
        newClause.atoms.removeIf { it.lit.spelling == "%placeholder%" }

        // Add new clause to clauseSet with adjusted variable-name
        clauses.add(newClause)
        state.newestNode = clauses.size - 1
        state.setSuffix(clauses.size - 1) // Re-name variables
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
        state: FoResolutionState,
        mainID: Int,
        atomMap: Map<Int, Pair<Int, Int>>
    ) {
        // Checks for correct clauseID and IDs in Map
        checkHyperID(state, mainID, atomMap)

        if (atomMap.isEmpty())
            throw IllegalMove("Please select side premisses for hyper resolution")

        val clauses = state.clauseSet.clauses
        val oldMainPremiss = clauses[mainID].clone()
        var mainPremiss = clauses[mainID].clone()

        // Resolves each side premiss with main premiss
        for ((mAtomID, pair) in atomMap) {
            val (sClauseID, sAtomID) = pair
            val sidePremiss = clauses[sClauseID]

            // Check side premiss for positiveness
            if (!sidePremiss.isPositive())
                throw IllegalMove("Side premiss $sidePremiss is not positive")

            // Resolve side premiss into main premiss every iteration
            mainPremiss = resolveSidePremiss(
                    mainPremiss,
                    oldMainPremiss.atoms[mAtomID],
                    sidePremiss,
                    sidePremiss.atoms[sAtomID]
            )
        }

        // Check there are no negative atoms anymore
        if (!mainPremiss.isPositive())
            throw IllegalMove("Resulting clause $mainPremiss is not positive")

        // Add resolved clause to clause set
        clauses.add(mainPremiss)
        state.newestNode = clauses.size - 1
    }

    /**
     * Resolves a main premiss with a side premiss with respect to a literal
     * @param mainPremiss The main premiss to resolve
     * @param mAtom atom in main Premiss
     * @param sidePremiss The side premiss to resolve
     * @param sAtom atom in side premiss
     * @return A instantiated clause which contains all atoms from main and side premiss
     *         except the one matching the literals of mAtomID and sAtomID.
     */
    private fun resolveSidePremiss(
        mainPremiss: Clause<Relation>,
        mAtom: Atom<Relation>,
        sidePremiss: Clause<Relation>,
        sAtom: Atom<Relation>
    ): Clause<Relation> {
        val literal1 = mAtom.lit
        val literal2 = sAtom.lit
        val mgu: Map<String, FirstOrderTerm>

        // Check that atom in main premiss is negative
        if (!mAtom.negated)
            throw IllegalMove("Literal '$mAtom' in main premiss has to be negative")

        // Get mgu from unification
        try {
            mgu = Unification.unify(literal1, literal2)
        } catch (e: UnificationImpossible) {
            throw IllegalMove("Could not unify '$mAtom' of main premiss with " +
                    "'$sAtom' of side premiss $sidePremiss: ${e.message}")
        }
        // Resolve mainPremiss with side premiss by given atom
        val mainResolveSide = buildClause(mainPremiss, mAtom, sidePremiss, sAtom)

        val newClause = Clause<Relation>()
        val instantiator = VariableInstantiator(mgu)
        // Build the new clause by cloning atoms from the base clause and applying instantiation
        mainResolveSide.atoms.forEach {
            val relationArgs = it.lit.arguments.map { it.clone().accept(instantiator) }
            val newRelation = Relation(it.lit.spelling, relationArgs)
            val newAtom = Atom<Relation>(newRelation, it.negated)
            newClause.add(newAtom)
        }
        return newClause
    }

    /**
     * Unifies two literals of a clause so that unification on whole clause can be used
     * @param clause clause to unify
     * @param a1 first literal to apply unification
     * @param a2 second literal to apply unification
     * @return Mapping to unify whole clause
     */
    @Suppress("ThrowsCount")
    private fun unifySingleClause(clause: Clause<Relation>, a1: Int, a2: Int): Map<String, FirstOrderTerm> {
        val atoms = clause.atoms
        // Verify that atom ids are valid
        if (a1 == a2)
            throw IllegalMove("Cannot unify an atom with itself")
        if (a1 < 0 || a1 >= atoms.size)
            throw IllegalMove("There is no atom with id $a1")
        if (a2 < 0 || a2 >= atoms.size)
            throw IllegalMove("There is no atom with id $a2")

        val literal1 = atoms[a1].lit
        val literal2 = atoms[a2].lit
        val mgu: Map<String, FirstOrderTerm>

        // Get unifier for chosen Atoms
        try {
            mgu = Unification.unify(literal1, literal2)
        } catch (e: UnificationImpossible) {
            throw IllegalMove("Could not unify '$literal1' and '$literal2': ${e.message}")
        }
        return mgu
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
    override val visualHelp: VisualHelp
) : GenericResolutionState<Relation>, ProtectedState() {
    override var newestNode = -1
    override val hiddenClauses = ClauseSet<Relation>()
    var clauseCounter = 0
    var statusMessage: String? = null

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
