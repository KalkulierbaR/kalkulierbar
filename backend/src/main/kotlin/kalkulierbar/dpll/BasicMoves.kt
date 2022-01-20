package kalkulierbar.dpll

import kalkulierbar.IllegalMove
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.parsers.TokenType
import kalkulierbar.parsers.Tokenizer

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
@Suppress("ComplexMethod")
fun propagate(state: DPLLState, branchID: Int, baseID: Int, propID: Int, atomID: Int) {
    // Checks all Restrictions according to propagate
    checkPropagateRestrictions(state, branchID, baseID, propID, atomID)

    val clauseSet = state.getClauseSet(branchID)
    val clauses = clauseSet.clauses
    val baseAtom = clauses[baseID].atoms[0]
    val propAtom = clauses[propID].atoms[atomID]

    // If the selected clause contains the atom which we know must be true,
    // the whole clause is trivially true and we can remove it from the set
    val diff = when (baseAtom) {
        propAtom -> RemoveClause(propID)
        // If the selected clause contains the negation of the atom known to be true,
        // that atom cannot be true and can be removed from the clause
        propAtom.not() -> RemoveAtom(propID, atomID)
        else -> throw IllegalMove("Selected atom '$propAtom' is not compatible with '$baseAtom'")
    }

    val propNode = TreeNode(branchID, NodeType.PROP, "prop", diff)
    state.addChildren(branchID, propNode)
    val propNodeID = state.tree.size - 1

    // Add proper annotations if the node created by propagation is closed or represents a model
    val newClauses = diff.apply(clauseSet).clauses

    // A node is considered closed if the clause set associated with it contains an empty clause
    if (newClauses.any { it.isEmpty() }) {
        state.addChildren(propNodeID, TreeNode(propNodeID, NodeType.CLOSED, "closed", Identity()))
    }
    // A node is considered a model if it contains only single-atom clauses
    // that do not contradict each other and contain no duplicates
    else if (
        newClauses.all { it.size == 1 } &&
        newClauses.map { it.atoms[0].lit }.distinct().size == newClauses.size
    ) {
        state.addChildren(propNodeID, TreeNode(propNodeID, NodeType.MODEL, "model", Identity()))
    }
}

@Suppress("ThrowsCount", "ComplexMethod")
private fun checkPropagateRestrictions(state: DPLLState, branchID: Int, baseID: Int, propID: Int, atomID: Int) {
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
}

/**
 * Applies a case distinction / split rule on a branch in the proof tree
 * @param state Proof state to apply the rule in
 * @param branchID The leaf node in the tree to apply the rule on
 * @param literal The variable to use for case distinction
 */
fun split(state: DPLLState, branchID: Int, literal: String) {
    // Check Restrictions according to split
    checkSplitRestrictions(state, branchID, literal)

    val tokenized = Tokenizer.tokenize(literal)
    val varToken = tokenized[0]
    val lit = varToken.spelling
    val branch = state.tree[branchID]

    // Add a case distinction for $literal
    val trueClause = Clause(mutableListOf(Atom(lit, false)))
    val falseClause = Clause(mutableListOf(Atom(lit, true)))
    val nodeTrue = TreeNode(branchID, NodeType.SPLIT, lit, AddClause(trueClause))
    val nodeFalse = TreeNode(branchID, NodeType.SPLIT, "¬$lit", AddClause(falseClause))

    state.tree.add(nodeTrue)
    branch.children.add(state.tree.size - 1)
    state.tree.add(nodeFalse)
    branch.children.add(state.tree.size - 1)
}

@Suppress("ThrowsCount")
private fun checkSplitRestrictions(state: DPLLState, branchID: Int, literal: String) {
    if (branchID < 0 || branchID >= state.tree.size)
        throw IllegalMove("Branch with ID $branchID does not exist")

    val branch = state.tree[branchID]
    if (!branch.isLeaf)
        throw IllegalMove("ID $branchID does not reference a leaf")
    if (branch.isAnnotation)
        throw IllegalMove("Cannot split on annotation '$branch'")

    val tokenized = Tokenizer.tokenize(literal)

    if (tokenized.size != 1)
        throw IllegalMove("Invalid variable name '$literal'")

    val varToken = tokenized[0]

    if (varToken.type != TokenType.CAPID && varToken.type != TokenType.LOWERID)
        throw IllegalMove("Invalid variable name '$literal'")
}

/**
 * Applies a prune rule on the proof tree
 * This removes all child nodes of a selected node, effectively resetting part
 * of the proof tree
 * @param state State to apply the rule in
 * @branchID ID of the node whose children will be pruned
 */
fun prune(state: DPLLState, branchID: Int) {
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
fun checkModel(state: DPLLState, branchID: Int, interpretation: Map<String, Boolean>) {
    if (branchID < 0 || branchID >= state.tree.size)
        throw IllegalMove("Branch with ID $branchID does not exist")

    val branch = state.tree[branchID]

    if (branch.type != NodeType.MODEL)
        throw IllegalMove("Node '$branch' is not a model node")

    if (branch.modelVerified == true)
        throw IllegalMove("This node has already been checked")

    val clauseSet = state.getClauseSet(branchID)

    // Check that the mapping satisfies every clause
    clauseSet.clauses.forEach { clause ->
        // Check if any atom in the clause is satisfied by the interpretation
        // (-> the atom's negated value is the opposite of the interp. truth value)
        if (!clause.atoms.any { !it.negated == interpretation[it.lit] })
            throw IllegalMove("The given interpretation does not satisfy any atom of clause $clause")
    }

    branch.modelVerified = true
    branch.label += " ✓"
}
