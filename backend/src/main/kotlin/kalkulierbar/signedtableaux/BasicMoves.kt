
package kalkulierbar.signedtableaux

import kalkulierbar.IllegalMove
import kalkulierbar.logic.And
import kalkulierbar.logic.Box
import kalkulierbar.logic.Diamond
import kalkulierbar.logic.Impl
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or

/**
 * If the given node is negated,
 * Node sign is changed, and the children node is added at the given leaf id.
 * @param state: SignedModalTableauxState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param leafID: ID of leaf , where the child should be attached to
 * @return new state after applying move
 */
fun applyNegation(state: SignedModalTableauxState, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.tree
    checkNodeRestrictions(state, nodeID)
    // If the leafID is not given, the new node will be added to all the available leaves
    if (leafID == null) {
        val leaves = state.childLeavesOf(nodeID)
        leaves.forEach {
            applyNegation(state, nodeID, it)
        }
        return state
    }

    val node = nodes[nodeID]
    val formula = node.formula

    if (formula !is Not)
        throw IllegalMove("Negation rule can only be applied on a negation")

    // new node with negated node sigh is added as a child of the given node
    state.addChildren(leafID, SignedModalTableauxNode(leafID, node.prefix, !node.sign, formula.child))

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(Negation(nodeID, leafID))
    return state
}

/**
 *  If an Alpha formula occurs on a branch, its two components can be added successively to the branch end.
 *  In case of multiple branch end, will be added to the branch whose leafID is given.
 * @param state: SignedModalTableauxState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param leafID: ID of leaf , where the child should be attached to
 * @return new state after applying move
 */
@Suppress("ThrowsCount", "ComplexMethod")
fun applyAlpha(state: SignedModalTableauxState, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.tree
    checkNodeRestrictions(state, nodeID)

    // If the leafID is not given, the new node will be added to all the available leaves
    if (leafID == null) {
        val leaves = state.childLeavesOf(nodeID)
        leaves.forEach {
            applyAlpha(state, nodeID, it)
        }
        return state
    }

    val node = nodes[nodeID]
    val formula = node.formula

    // Check if the node is T And , F Or or F Impl: only then can be Alpha move applied
    val alpha1: SignedModalTableauxNode
    val alpha2: SignedModalTableauxNode

    when (formula) {
        is And -> {
            // Alpha move can only be applied if the node sign is TRUE if the Formula is And
            if (!node.sign)
                throw IllegalMove("Alpha rule can only be applied on a conjunction if the sign is True")
            alpha1 = SignedModalTableauxNode(leafID, node.prefix, true, formula.leftChild)
            alpha2 = SignedModalTableauxNode(nodes.size, node.prefix, true, formula.rightChild)
        }
        is Or -> {
            // Alpha move can only be applied if the node sign is FALSE if the Formula is OR
            if (node.sign)
                throw IllegalMove("Alpha rule can only be applied on a disjunction if the sign is False")
            alpha1 = SignedModalTableauxNode(leafID, node.prefix, false, formula.leftChild)
            alpha2 = SignedModalTableauxNode(nodes.size, node.prefix, false, formula.rightChild)
        }
        is Impl -> {
            // Alpha move can only be applied if the node sign is FALSE if the Formula is IMPL
            if (node.sign)
                throw IllegalMove("Alpha rule can only be applied on an implication if the sign is False")
            alpha1 = SignedModalTableauxNode(leafID, node.prefix, true, formula.leftChild)
            alpha2 = SignedModalTableauxNode(nodes.size, node.prefix, false, formula.rightChild)
        }
        else -> throw IllegalMove("Alpha rule can not be applied on the node '$node'")
    }

    // The left formula is will be add to the node first, right formula will be added as the child of left formula
    state.addChildren(leafID, alpha1)
    state.addChildren(nodes.size - 1, alpha2)

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(AlphaMove(nodeID, leafID))
    return state
}

/**
 *  if a Beta formula occurs, the branch can be split, with one component added to each of the new branch ends.
 *  In case of multiple branch end, will be added to the branch whose leafID is given.
 * @param state: SignedModalTableauxState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param leafID: ID of leaf, where the child should be attached to
 * @return new state after applying move
 */
@Suppress("ThrowsCount", "ComplexMethod")
fun applyBeta(state: SignedModalTableauxState, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.tree
    checkNodeRestrictions(state, nodeID)
    // If the leafID is not given, the new node will be added to all the available leaves
    if (leafID == null) {
        val leaves = state.childLeavesOf(nodeID)
        leaves.forEach {
            applyBeta(state, nodeID, it)
        }
        return state
    }

    val node = nodes[nodeID]
    val formula = node.formula

    val beta1: SignedModalTableauxNode
    val beta2: SignedModalTableauxNode

    // Check if the node is F And, T Or or T Impl: only then can be Beta move applied
    when (formula) {
        is And -> {
            if (node.sign)
                throw IllegalMove("Beta rule can only be applied on a conjunction if the sign is True")
            beta1 = SignedModalTableauxNode(leafID, node.prefix, false, formula.leftChild)
            beta2 = SignedModalTableauxNode(leafID, node.prefix, false, formula.rightChild)
        }
        is Or -> {
            if (!node.sign)
                throw IllegalMove("Beta rule can only be applied on a disjunction if the sign is False")
            beta1 = SignedModalTableauxNode(leafID, node.prefix, true, formula.leftChild)
            beta2 = SignedModalTableauxNode(leafID, node.prefix, true, formula.rightChild)
        }
        is Impl -> {
            if (!node.sign)
                throw IllegalMove("Beta rule can only be applied on an implication if the sign is False")
            beta1 = SignedModalTableauxNode(leafID, node.prefix, false, formula.leftChild)
            beta2 = SignedModalTableauxNode(leafID, node.prefix, true, formula.rightChild)
        }
        else -> throw IllegalMove("Beta rule can not be applied on the node '$node'")
    }

    // The formula will be split, the leftFormula will be added to the leftBranch of the leaf and the
    // the right formula will be added to the right branch fo the leaf.
    state.addChildren(leafID, beta1, beta2)

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(BetaMove(nodeID, leafID))
    return state
}

/**
 *  if a NU formula occurs, the prefix that is already used will be used in the new node,
 *  and the node with out the modal variable is added to the branch end.
 *  In case of multiple branch end, will be added to the branch whose leafID is given.
 * @param state: SignedModalTableauxState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param prefix : Prefix that should be used
 * @param leafID: ID of leaf , where the child should be attached to
 * @return new state after applying move
 */
@Suppress("ThrowsCount", "ComplexMethod")
fun applyNu(state: SignedModalTableauxState, prefix: Int, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.tree
    checkNodeRestrictions(state, nodeID)
    // If the leafID is not given, the new node will be added to all the available leaves
    if (leafID == null) {
        val leaves = state.childLeavesOf(nodeID)
        leaves.forEach {
            applyNu(state, prefix, nodeID, it)
        }
        return state
    }

    val node = nodes[nodeID]
    val formula = node.formula

    // The new prefix will be 𝜎.n, where n is already used
    val newPrefix = node.prefix.toMutableList()
    newPrefix.add(prefix)

    if (!state.prefixIsUsedOnBranch(leafID, newPrefix))
        throw IllegalMove("Prefix has to be already in use on the selected branch")

    // Check if the node is T Box ( [] ) or F DIAMOND ( <> ) : only then can be NU move applied
    val nu0 = when (formula) {
        is Box -> {
            if (!node.sign)
                throw IllegalMove("Nu rule can only be applied on BOX if the sign is True")
            SignedModalTableauxNode(leafID, newPrefix, true, formula.child)
        }
        is Diamond -> {
            if (node.sign)
                throw IllegalMove("Nu rule can only be applied on DIAMOND if the sign is False")
            SignedModalTableauxNode(leafID, newPrefix, false, formula.child)
        }
        else -> throw IllegalMove("Nu rule can not be applied on the node '$node'")
    }

    state.addChildren(leafID, nu0)

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(NuMove(prefix, nodeID, leafID))
    return state
}

/**
 *  if a PI formula occurs, the new Prefix will be used in the new node,
 *  and the node with out the modal variable is added to the branch end.
 *  In case of multiple branch end, will be added to the branch whose leafID is given.
 * @param state: SignedModalTableauxState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param prefix : Prefix that should be used
 * @param leafID: ID of leaf , where the child should be attached to
 * @return new state after applying move
 */
@Suppress("ThrowsCount", "ComplexMethod")
fun applyPi(state: SignedModalTableauxState, prefix: Int, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.tree
    checkNodeRestrictions(state, nodeID)

    // If the leafID is not given, the new node will be added to all the available leaves
    if (leafID == null) {
        val leaves = state.childLeavesOf(nodeID)
        leaves.forEach {
            applyPi(state, prefix, nodeID, it)
        }
        return state
    }

    val node = nodes[nodeID]
    val formula = node.formula

    // The new prefix will be 𝜎.n, where n is a new prefix
    val newPrefix = node.prefix.toMutableList()
    newPrefix.add(prefix)

    if (state.prefixIsUsedOnBranch(leafID, newPrefix))
        throw IllegalMove("Prefix is already in use on the selected branch")
    // Check if the node is F Box ( [] ) or T DIAMOND ( <> ) : only then can be NU move applied
    val pi0 = when (formula) {
        is Box -> {
            if (node.sign)
                throw IllegalMove("Operation can only be applied in box if the sign is False")
            SignedModalTableauxNode(leafID, newPrefix, false, formula.child)
        }
        is Diamond -> {
            if (!node.sign)
                throw IllegalMove("Operation can only be applied in diamond if the sign is True")
            SignedModalTableauxNode(leafID, newPrefix, true, formula.child)
        }
        else -> throw IllegalMove("Pi Rule can not be applied on the node '$node'")
    }

    state.addChildren(leafID, pi0)

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(PiMove(prefix, nodeID, leafID))
    return state
}

/**
 * Prune all the children of the given node.
 * @param state: SignedModalTableaux state to apply move on
 * @param nodeID: ID of node to apply move on
 * @return new state after applying move
 */
fun applyPrune(state: SignedModalTableauxState, nodeID: Int): SignedModalTableauxState {
    if (!state.backtracking)
        throw IllegalMove("Backtracking is not enabled for this proof")

    state.moveHistory.add(Prune(nodeID))
    state.pruneBranch(nodeID)
    return state
}

/**
 * Applies close move by following constraints:
 * 1. The selected formulas are of opposite sign
 * 2. The selected formulas have the same prefix.
 * 3. The selected formula is syntactically equivalent.
 * @param state State to apply close move on
 * @param nodeID Node to close
 * @param closeID:Node to close with
 * @return state after applying move
 */
@Suppress("ThrowsCount")
fun applyClose(state: SignedModalTableauxState, nodeID: Int, closeID: Int): SignedModalTableauxState {
    val nodes = state.tree

    if (closeID < nodeID)
        return applyClose(state, closeID, nodeID)

    checkCloseIDRestrictions(state, nodeID, closeID)

    val node = nodes[nodeID]
    val leaf = nodes[closeID]

    if (node.sign == leaf.sign)
        throw IllegalMove("The selected formulas are not of opposite sign")

    if (node.prefix != leaf.prefix)
        throw IllegalMove("The selected formulas do not have the same prefix")

    if (!node.formula.synEq(leaf.formula))
        throw IllegalMove("The selected formulas are not syntactically equivalent")

    leaf.closeRef = nodeID
    state.setClosed(closeID)

    if (state.backtracking)
        state.moveHistory.add(CloseMove(nodeID, closeID))

    return state
}

/**
 * Check restrictions for nodeID and closeID
 */
private fun checkCloseIDRestrictions(state: SignedModalTableauxState, nodeID: Int, closeID: Int) {
    checkNodeRestrictions(state, nodeID)
    state.checkNodeID(closeID)
    
    // Verify that closeNode is transitive parent of node
    if (!state.nodeIsParentOf(nodeID, closeID))
        throw IllegalMove("Node '${state.tree[closeID]}' is not an ancestor of node '${state.tree[nodeID]}'")
}

/**
 * Check nodeID valid + already closed
 */
fun checkNodeRestrictions(state: SignedModalTableauxState, nodeID: Int) {
    state.checkNodeID(nodeID)
    // Verify that node is not already closed
    if (state.tree[nodeID].isClosed)
        throw IllegalMove("Node '${state.tree[nodeID]}' is already closed")
}
