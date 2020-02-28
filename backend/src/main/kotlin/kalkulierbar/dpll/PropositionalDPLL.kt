package kalkulierbar.dpll

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.parsers.FlexibleClauseSetParser
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class PropositionalDPLL : JSONCalculus<DPLLState, DPLLMove, Unit>() {

    override val identifier = "prop-dpll"

    private val serializer = Json(context = dpllMoveModule + clausesetDiffModule)

    override fun parseFormulaToState(formula: String, params: Unit?): DPLLState {
        val clauses = FlexibleClauseSetParser.parse(formula)
        val state = DPLLState(clauses)
        state.tree.add(TreeNode(null, NodeType.ROOT, "true", Identity()))

        return state
    }

    override fun applyMoveOnState(state: DPLLState, move: DPLLMove): DPLLState {
        when (move) {
            is MovePropagate -> propagate(state, move.branch, move.baseClause, move.propClause, move.propAtom)
            is MoveSplit -> split(state, move.branch, move.literal)
            is MovePrune -> prune(state, move.branch)
            is MoveModelCheck -> checkModel(state, move.branch, move.interpretation)
            else -> throw IllegalMove("Unknown move")
        }
        return state
    }

    /**
     * Applies a propagation rule on a leaf node of the proof tree
     * This can either be removing a clause known to be satisfied
     * or removing an atom from a clause that is known to be false
     * @param state State the rule is to be applied in
     * @param branchID Node of the proof tree the rule is to be applied on
     * @param baseID ID of the clause to be used for propagation (single-atom clause)
     * @param propID ID of the clause that will be simplified by the rule
     * @param atomID Index of the atom used for propagation in the propID clause
     */
    @Suppress("ThrowsCount", "ComplexMethod")
    private fun propagate(state: DPLLState, branchID: Int, baseID: Int, propID: Int, atomID: Int) {

        // Check branch validity
        if (branchID < 0 || branchID >= state.tree.size)
            throw IllegalMove("Branch with ID $branchID does not exist")
        val branch = state.tree[branchID]
        if (!branch.isLeaf)
            throw IllegalMove("ID $branchID does not reference a leaf")
        if (branch.isAnnotation)
            throw IllegalMove("Cannot propagate on annotation '$branch'")

        val clauseSet = state.getClauseSet(branchID)
        val clauses = clauseSet.clauses

        // Check baseID, propID, atomID validity
        if (baseID < 0 || baseID >= clauses.size)
            throw IllegalMove("Clause set $clauses has no clause with ID $baseID")
        if (propID < 0 || propID >= clauses.size)
            throw IllegalMove("Clause set $clauses has no clause with ID $propID")
        if (atomID < 0 || atomID >= clauses[propID].size)
            throw IllegalMove("Clause ${clauses[propID]} has no atom with ID $atomID")
        if (baseID == propID)
            throw IllegalMove("Base and propagation clauses have to be different")

        val base = clauses[baseID]
        if (base.size != 1)
            throw IllegalMove("Base clause $base may only have exactly one atom")

        val baseAtom = base.atoms[0]
        val propAtom = clauses[propID].atoms[atomID]
        val diff: CsDiff

        // If the selected clause contains the atom which we know must be true,
        // the whole clause is trivially true and we can remove it from the set
        if (baseAtom == propAtom)
            diff = RemoveClause(propID)
        // If the selected clause contains the negation of the atom known to be true,
        // that atom cannot be true and can be removed from the clause
        else if (baseAtom == propAtom.not())
            diff = RemoveAtom(propID, atomID)
        else
            throw IllegalMove("Selected atom '$propAtom' is not compatible with '$baseAtom'")

        val propNode = TreeNode(branchID, NodeType.PROP, "prop", diff)
        val propNodeID = state.tree.size
        state.tree.add(propNode)
        branch.children.add(propNodeID)

        // Add proper annotations if the node created by propagation is closed or represents a model
        val newClauses = diff.apply(clauseSet).clauses

        // A node is considered closed if the clause set associated with it contains an empty clause
        if (newClauses.any { it.isEmpty() }) {
            state.tree.add(TreeNode(propNodeID, NodeType.CLOSED, "closed", Identity()))
            propNode.children.add(state.tree.size - 1)
        }
        // A node is considered a model if it contains only single-atom clauses
        // that do not contradict each other and contain no duplicates
        else if (
            newClauses.all { it.size == 1 } &&
            newClauses.map { it.atoms[0].lit }.distinct().size == newClauses.size
        ) {
            state.tree.add(TreeNode(propNodeID, NodeType.MODEL, "model", Identity()))
            propNode.children.add(state.tree.size - 1)
        }
    }

    /**
     * Applies a case distinction / split rule on a branch in the proof tree
     * @param state Proof state to apply the rule in
     * @param branchID The leaf node in the tree to apply the rule on
     * @param literal The variable to use for case distinction
     */
    @Suppress("ThrowsCount")
    private fun split(state: DPLLState, branchID: Int, literal: String) {
        if (branchID < 0 || branchID >= state.tree.size)
            throw IllegalMove("Branch with ID $branchID does not exist")

        val branch = state.tree[branchID]
        if (!branch.isLeaf)
            throw IllegalMove("ID $branchID does not reference a leaf")
        if (branch.isAnnotation)
            throw IllegalMove("Cannot split on annotation '$branch'")

        // Add a case distinction for $literal
        val trueClause = Clause(mutableListOf(Atom(literal, false)))
        val falseClause = Clause(mutableListOf(Atom(literal, true)))
        val nodeTrue = TreeNode(branchID, NodeType.SPLIT, "$literal", AddClause(trueClause))
        val nodeFalse = TreeNode(branchID, NodeType.SPLIT, "¬$literal", AddClause(falseClause))

        state.tree.add(nodeTrue)
        branch.children.add(state.tree.size - 1)
        state.tree.add(nodeFalse)
        branch.children.add(state.tree.size - 1)
    }

    /**
     * Applies a prune rule on the proof tree
     * This removes all child nodes of a selected node, effectively resetting part
     * of the proof tree
     * @param state State to apply the rule in
     * @branchID ID of the node whose children will be pruned
     */
    private fun prune(state: DPLLState, branchID: Int) {
        if (branchID < 0 || branchID >= state.tree.size)
            throw IllegalMove("Branch with ID $branchID does not exist")

        val node = state.tree[branchID]

        // Weird things would happen if we would allow removing annotations
        if (node.children.size == 1 && state.tree[node.children[0]].isAnnotation)
            throw IllegalMove("Cannot prune annotation '${state.tree[node.children[0]]}'")

        state.pruneBranch(branchID)
    }

    /**
     * Checks if a given variable interpretation satisfies the clause set associated with a node
     * @param state State to apply the check in
     * @param branchID ID of a model node for which the interpretation should be checked
     * @param interpretation A map assigning truth values to variables
     */
    @Suppress("ThrowsCount")
    private fun checkModel(state: DPLLState, branchID: Int, interpretation: Map<String, Boolean>) {
        if (branchID < 0 || branchID >= state.tree.size)
            throw IllegalMove("Branch with ID $branchID does not exist")

        val branch = state.tree[branchID]

        if (branch.type != NodeType.MODEL)
            throw IllegalMove("Node '$branch' is not a model node")

        val clauseSet = state.getClauseSet(branchID)

        // Check that the mapping satisfies every clause
        clauseSet.clauses.forEach {
            val atoms = it.atoms
            // Check if any atom in the clause is satisfied by the interpretation
            // (-> the atom's negated value is the opposite of the interp. truth value)
            if (!atoms.any { !it.negated == interpretation[it.lit] })
                throw IllegalMove("The given interpretation does not satisfy any atom of clause $it")
        }

        branch.modelVerified = true
        branch.label += " (checked)"
    }

    override fun checkCloseOnState(state: DPLLState): CloseMessage {
        // A proof is closed if every leaf is a 'closed' annotation
        // (which means every proper leaf contains the empty clause)
        val closed = state.tree.all { !it.isLeaf || it.type == NodeType.CLOSED }
        // There are no more rules to be applied if every leaf is an annotation
        // (-> every proper leaf is either closed or has a model)
        val done = state.tree.all { !it.isLeaf || it.isAnnotation }
        val msg: String

        if (closed)
            msg = "The proof is closed and proves the unsatisfiability of the clause set"
        else {
            val donemsg = if (done) "- however, all branches are completed. The clause set is satisfiable." else "yet."
            msg = "The proof is not closed $donemsg"
        }

        return CloseMessage(closed, msg)
    }

    @Suppress("TooGenericExceptionCaught")
    override fun jsonToState(json: String): DPLLState {
        try {
            val parsed = serializer.parse(DPLLState.serializer(), json)

            // Ensure valid, unmodified state object
            if (!parsed.verifySeal())
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

            return parsed
        } catch (e: Exception) {
            val msg = "Could not parse JSON state: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    override fun stateToJson(state: DPLLState): String {
        state.computeSeal()
        return serializer.stringify(DPLLState.serializer(), state)
    }

    @Suppress("TooGenericExceptionCaught")
    override fun jsonToMove(json: String): DPLLMove {
        try {
            return serializer.parse(DPLLMove.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON move: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    override fun jsonToParam(json: String) = Unit
}
