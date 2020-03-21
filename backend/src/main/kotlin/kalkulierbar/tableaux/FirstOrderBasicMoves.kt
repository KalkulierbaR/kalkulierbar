package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kalkulierbar.UnificationImpossible
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.transform.VariableInstantiator
import kalkulierbar.logic.util.Unification
import kalkulierbar.logic.util.UnifierEquivalence

/**
 * Attempt to close a branch using automatic unification
 * @param state State to apply the close move in
 * @param leafID Leaf to close
 * @param closeNodeID Node to close the leaf with
 * @return state with the close move applied
 */
fun applyAutoCloseBranch(state: FoTableauxState, leafID: Int, closeNodeID: Int): FoTableauxState {
    if (state.manualVarAssign)
        throw IllegalMove("Auto-close is not enabled for this proof")

    ensureBasicCloseability(state, leafID, closeNodeID)
    val leaf = state.nodes[leafID]
    val closeNode = state.nodes[closeNodeID]

    // Try to find a unifying variable assignment and pass it to the internal close method
    // which will handle the verification, tree modification, and history management for us
    try {
        val varAssign = Unification.unify(leaf.relation, closeNode.relation)
        return closeBranchCommon(state, leafID, closeNodeID, varAssign)
    } catch (e: UnificationImpossible) {
        throw IllegalMove("Cannot unify '$leaf' and '$closeNode': ${e.message}")
    }
}

/**
 * Attempt to close a branch using manual unification
 * @param state State to apply the close move in
 * @param leafID Leaf to close
 * @param closeNodeID Node to close the leaf with
 * @param varAssign Map of variable names and terms to replace them with
 * @return state with the close move applied
 */
fun applyMoveCloseBranch(
    state: FoTableauxState,
    leafID: Int,
    closeNodeID: Int,
    varAssign: Map<String, FirstOrderTerm>
): FoTableauxState {
    ensureBasicCloseability(state, leafID, closeNodeID)

    val leaf = state.nodes[leafID]
    val closeNode = state.nodes[closeNodeID]
    // Check that given var assignment is a mgu, warn if not
    if (!UnifierEquivalence.isMGUorNotUnifiable(varAssign, leaf.relation, closeNode.relation))
        state.statusMessage = "The unifier you specified is not an MGU"

    return closeBranchCommon(state, leafID, closeNodeID, varAssign)
}

@Suppress("ThrowsCount")
/**
 * Close a branch using either computed or manually entered variable assignments
 * NOTE: This does NOT verify closeability.
 *       It is assumed that ensureBasicCloseability has been called before.
 * @param state State to apply the close move in
 * @param leafID Leaf to close
 * @param closeNodeID Node to close the leaf with
 * @param varAssign Map of variable names and terms to replace them with
 * @return state with the close move applied
 */
private fun closeBranchCommon(
    state: FoTableauxState,
    leafID: Int,
    closeNodeID: Int,
    varAssign: Map<String, FirstOrderTerm>
): FoTableauxState {

    val leaf = state.nodes[leafID]
    val closeNode = state.nodes[closeNodeID]

    // Apply all specified variable instantiations globally
    applyVarInstantiation(state, varAssign)

    if (!leaf.relation.synEq(closeNode.relation))
        throw IllegalMove("Node '$leaf' and '$closeNode' are not equal after variable instantiation")

    // Instantiating variables globally may violate regularity in unexpected places
    if (state.regular && !checkRegularity(state))
        throw IllegalMove("This variable instantiation would violate the proof regularity")

    // Close branch
    leaf.closeRef = closeNodeID
    state.setNodeClosed(leaf)

    // Record close move for backtracking purposes
    if (state.backtracking) {
        val varAssignStrings = varAssign.mapValues { it.value.toString() }
        val move = MoveCloseAssign(leafID, closeNodeID, varAssignStrings)
        state.moveHistory.add(move)
    }

    return state
}

/**
 * Expand a clause at a given leaf in the proof tree
 * @param state State to apply expansion in
 * @param leafID Leaf to expand
 * @param clauseID Clause to expand
 * @return State with the expansion applied
 */
fun applyMoveExpandLeaf(state: FoTableauxState, leafID: Int, clauseID: Int): FoTableauxState {

    // Ensure that preconditions (correct indices, regularity) are met
    ensureExpandability(state, leafID, clauseID)
    val clause = state.clauseSet.clauses[clauseID]
    val leaf = state.nodes[leafID]

    // Quantified variables need to be unique in every newly expanded clause
    // So we append a suffix with the number of the current expansion to every variable
    val atoms = state.clauseExpandPreprocessing(clause)

    // Add new leaves to the proof tree
    for (atom in atoms) {
        val newLeaf = FoTableauxNode(leafID, atom.lit, atom.negated)
        state.nodes.add(newLeaf)
        leaf.children.add(state.nodes.size - 1)
    }

    // Verify compliance with connectedness criteria
    verifyExpandConnectedness(state, leafID)

    // Record expansion for backtracking
    if (state.backtracking)
        state.moveHistory.add(MoveExpand(leafID, clauseID))

    state.expansionCounter += 1

    return state
}

/**
 * Appends the negation of a closed node on a leaf (lemma rule)
 * provided the chosen leaf is on a sibling-branch of the closed node
 * @param state Current proof state to apply the move on
 * @param leafID ID of the leaf to append the lemma to
 * @param lemmaID ID of the proof tree node to create a lemma from
 * @return new proof state with lemma applied
 */
fun applyMoveUseLemma(state: FoTableauxState, leafID: Int, lemmaID: Int): FoTableauxState {
    // Get lemma atom and verify all preconditions
    val atom = state.getLemma(leafID, lemmaID)

    // Add lemma atom to leaf
    // NOTE: We explicitly do not apply clause preprocessing for Lemma expansions
    val newLeaf = FoTableauxNode(leafID, atom.lit, atom.negated, lemmaID)
    state.nodes.add(newLeaf)
    state.nodes[leafID].children.add(state.nodes.size - 1)

    // Verify compliance with connectedness criteria
    verifyExpandConnectedness(state, leafID)

    // Add move to state history
    if (state.backtracking) {
        state.moveHistory.add(MoveLemma(leafID, lemmaID))
    }

    return state
}

/**
 * Apply a global variable instantiation in the proof tree
 * @param state State to apply instantiation in
 * @param varAssign Map of which variables to replace with which terms
 * @return State with all occurences of variables in the map replaced with their respective terms
 */
private fun applyVarInstantiation(state: FoTableauxState, varAssign: Map<String, FirstOrderTerm>): FoTableauxState {
    val instantiator = VariableInstantiator(varAssign)

    state.nodes.forEach {
        it.relation.arguments = it.relation.arguments.map { it.accept(instantiator) }
    }

    return state
}
