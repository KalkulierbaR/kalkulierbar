
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
 * @param leafID: ID of leaf , where the child should be attatched to
 * @return new state after applying move
 */
fun applyNegation(state: SignedModalTableauxState, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.nodes
    checkNodeRestrictions(nodes, nodeID)
    // If the leafID is not given, the new node will be added to all the available Leaf.
    if (leafID == null) {
        var leafs = state.childLeavesOf(nodeID)
        leafs.forEach {
            checkNodeRestrictions(nodes, it)
            applyNegation(state, nodeID, it)
        }
        return state
    }

    val node = nodes[nodeID]
    val leaf = nodes[leafID]
    val formula = node.formula

    if (formula !is Not)
        throw IllegalMove("Outermost logic operator is not NOT")

    // new node with Negated node sigh is added as a child of the given node.
    nodes.add(SignedModalTableauxNode(leafID, node.prefix, !node.sign, formula.child))
    leaf.children.add(state.nodes.size - 1)

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
 * @param leafID: ID of leaf , where the child should be attatched to
 * @return new state after applying move
 */
@Suppress("ThrowsCount", "ComplexMethod")
fun applyAlpha(state: SignedModalTableauxState, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.nodes
    checkNodeRestrictions(nodes, nodeID)
    // If the leafID is not given, the new node will be added to all the available Leaf.
    if (leafID == null) {
        var leafs = state.childLeavesOf(nodeID)
        leafs.forEach {
            checkNodeRestrictions(nodes, it)
            applyAlpha(state, nodeID, it)
        }
        return state
    }

    val node = nodes[nodeID]
    val leaf = nodes[leafID]
    val formula = node.formula

    // Check if the node is T And , F Or or F Impl: only then can be Alpha move applied
    if (formula is And) {
        // Alpha move can only be applied if the node sign is TRUE if the Formula is And
        if (node.sign == false)
            throw IllegalMove("Operation can only be applied in AND if the sign is True")
        var leftFormula = formula.leftChild
        var rightFormula = formula.rightChild

        // The left Formula is will be add to the node first, right formula will be added at the child of left formula
        var alpha1 = SignedModalTableauxNode(leafID, node.prefix, true, leftFormula)
        nodes.add(alpha1)
        leaf.children.add(nodes.size - 1)
        var alpha2 = SignedModalTableauxNode(nodes.size - 1, node.prefix, true, rightFormula)
        nodes.add(alpha2)
        alpha1.children.add(nodes.size - 1)
    } else if (formula is Or) {
        // Alpha move can only be applied if the node sign is FALSE if the Formula is OR
        if (node.sign == true)
            throw IllegalMove("Operation can only be applied in OR if the sign is False")
        var leftFormula = formula.leftChild
        var rightFormula = formula.rightChild

        // The left Formula is will be add to the node first, right formula will be added at the child of left formula
        var alpha1 = SignedModalTableauxNode(leafID, node.prefix, false, leftFormula)
        nodes.add(alpha1)
        leaf.children.add(nodes.size - 1)
        var alpha2 = SignedModalTableauxNode(nodes.size - 1, node.prefix, false, rightFormula)
        nodes.add(alpha2)
        alpha1.children.add(nodes.size - 1)
    } else if (formula is Impl) {
        // Alpha move can only be applied if the node sign is FALSE if the Formula is IMPL
        if (node.sign == true)
            throw IllegalMove("Operation can only be applied in IMPL if the sign is False")
        var leftFormula = formula.leftChild
        var rightFormula = formula.rightChild

        // The left Formula is will be add to the node first, right formula will be added at the child of left formula
        var alpha1 = SignedModalTableauxNode(leafID, node.prefix, true, leftFormula)
        nodes.add(alpha1)
        leaf.children.add(nodes.size - 1)
        var alpha2 = SignedModalTableauxNode(nodes.size - 1, node.prefix, false, rightFormula)
        nodes.add(alpha2)
        alpha1.children.add(nodes.size - 1)
    } else {
        throw IllegalMove("Alpha Rule can not be applied on the node $node")
    }

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
 * @param leafID: ID of leaf , where the child should be attatched to
 * @return new state after applying move
 */
@Suppress("ThrowsCount", "ComplexMethod")
fun applyBeta(state: SignedModalTableauxState, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.nodes
    checkNodeRestrictions(nodes, nodeID)
    // If the leafID is not given, the new node will be added to all the available Leaf.
    if (leafID == null) {
        var leafs = state.childLeavesOf(nodeID)
        leafs.forEach {
            checkNodeRestrictions(nodes, it)
            applyBeta(state, nodeID, it)
        }
        return state
    }

    val node = nodes[nodeID]
    val leaf = nodes[leafID]
    val formula = node.formula

    // Check if the node is F And , T Or or T Impl: only then can be Beta move applied
    if (formula is And) {
        // Beta move can only be applied if the node sign is FALSE if the Formula is AND
        if (node.sign == true)
            throw IllegalMove("Operation can only be applied in AND if the sign is True")
        var leftFormula = formula.leftChild
        var rightFormula = formula.rightChild

        // The formula will be splited, and the leftFormula will be added to the leftBranch of the Leaf and the
        // the right formula will be added to the right branch fo the leaf.
        var beta1 = SignedModalTableauxNode(leafID, node.prefix, false, leftFormula)
        nodes.add(beta1)
        leaf.children.add(nodes.size - 1)
        var beta2 = SignedModalTableauxNode(leafID, node.prefix, false, rightFormula)
        nodes.add(beta2)
        leaf.children.add(nodes.size - 1)
    } else if (formula is Or) {
        // Beta move can only be applied if the node sign is TRUE if the Formula is OR
        if (node.sign == false)
            throw IllegalMove("Operation can only be applied in OR if the sign is False")
        var leftFormula = formula.leftChild
        var rightFormula = formula.rightChild

        // The formula will be splited, and the leftFormula will be added to the leftBranch of the Leaf and the
        // the right formula will be added to the right branch fo the leaf.
        var beta1 = SignedModalTableauxNode(leafID, node.prefix, true, leftFormula)
        nodes.add(beta1)
        leaf.children.add(nodes.size - 1)
        var beta2 = SignedModalTableauxNode(leafID, node.prefix, true, rightFormula)
        nodes.add(beta2)
        leaf.children.add(nodes.size - 1)
    } else if (formula is Impl) {
        // Beta move can only be applied if the node sign is TRUE if the Formula is IMPL
        if (node.sign == false)
            throw IllegalMove("Operation can only be applied in IMPL if the sign is False")
        var leftFormula = formula.leftChild
        var rightFormula = formula.rightChild

        // The formula will be splited, and the leftFormula will be added to the leftBranch of the Leaf and the
        // the right formula will be added to the right branch fo the leaf.
        var beta1 = SignedModalTableauxNode(leafID, node.prefix, false, leftFormula)
        nodes.add(beta1)
        leaf.children.add(nodes.size - 1)
        var beta2 = SignedModalTableauxNode(leafID, node.prefix, true, rightFormula)
        nodes.add(beta2)
        leaf.children.add(nodes.size - 1)
    } else {
        throw IllegalMove("Beta Rule can not be applied on the node $node")
    }

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(BetaMove(nodeID, leafID))
    return state
}

/**
 *  if a NU formula occurs, the prefix that is alread used will be used in the new node,
 *  and the node with out the modal variable is added to the branch end.
 *  In case of multiple branch end, will be added to the branch whose leafID is given.
 * @param state: SignedModalTableauxState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param prefix : Prefix that should be used
 * @param leafID: ID of leaf , where the child should be attatched to
 * @return new state after applying move
 */
@Suppress("ThrowsCount", "ComplexMethod")
fun applyNu(state: SignedModalTableauxState, prefix: Int, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.nodes
    checkNodeRestrictions(nodes, nodeID)
    // If the leafID is not given, the new node will be added to all the available Leaf.
    if (leafID == null) {
        var leafs = state.childLeavesOf(nodeID)
        leafs.forEach {
            checkNodeRestrictions(nodes, it)
            applyNu(state, prefix, nodeID, it)
        }
        return state
    }

    val node = nodes[nodeID]
    val leaf = nodes[leafID]
    val formula = node.formula

    // The new prifix will be 𝜎.n, where n is already used
    var newPrefix = node.prefix.toMutableList()
    newPrefix.add(prefix)

    if (!state.prefixIsUsedOnBranch(leafID, newPrefix))
        throw IllegalMove("Prefix has to be already in use on the selected branch")

    // Check if the node is T Box ( [] ) or F DIAMOD ( <> ) : only then can be NU move applied
    if (formula is Box) {
        if (node.sign == false)
            throw IllegalMove("Operation can only be applied in BOX if the sign is True")
        var childFormula = formula.child

        var nu0 = SignedModalTableauxNode(leafID, newPrefix, true, childFormula)
        nodes.add(nu0)
        leaf.children.add(nodes.size - 1)
    } else if (formula is Diamond) {
        if (node.sign == true)
            throw IllegalMove("Operation can only be applied in DIAMOND if the sign is False")
        var childFormula = formula.child

        var nu0 = SignedModalTableauxNode(leafID, newPrefix, false, childFormula)
        nodes.add(nu0)
        leaf.children.add(nodes.size - 1)
    } else {
        throw IllegalMove("Nu Rule can not be applied on the node $node")
    }

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(NuMove(prefix, nodeID, leafID))
    return state
}

/**
 *  if a PI formula occurs, the new Prifix will be used in the new node,
 *  and the node with out the modal variable is added to the branch end.
 *  In case of multiple branch end, will be added to the branch whose leafID is given.
 * @param state: SignedModalTableauxState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param prefix : Prefix that should be used
 * @param leafID: ID of leaf , where the child should be attatched to
 * @return new state after applying move
 */
@Suppress("ThrowsCount", "ComplexMethod")
fun applyPi(state: SignedModalTableauxState, prefix: Int, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.nodes
    checkNodeRestrictions(nodes, nodeID)
    // If the leafID is not given, the new node will be added to all the available Leaf.
    if (leafID == null) {
        var leafs = state.childLeavesOf(nodeID)
        leafs.forEach {
            checkNodeRestrictions(nodes, it)
            applyPi(state, prefix, nodeID, it)
        }
        return state
    }

    val node = nodes[nodeID]
    val leaf = nodes[leafID]
    val formula = node.formula

    // The new prifix will be 𝜎.n, where n is a new prefex
    var newPrefix = node.prefix.toMutableList()
    newPrefix.add(prefix)

    if (state.prefixIsUsedOnBranch(leafID, newPrefix))
        throw IllegalMove("Prefix has to not be already in use on the selected branch")
    // Check if the node is F Box ( [] ) or T DIAMOD ( <> ) : only then can be NU move applied
    if (formula is Box) {
        if (node.sign == true)
            throw IllegalMove("Operation can only be applied in BOX if the sign is False")
        var childFormula = formula.child

        var nu0 = SignedModalTableauxNode(leafID, newPrefix, false, childFormula)
        nodes.add(nu0)
        leaf.children.add(nodes.size - 1)
    } else if (formula is Diamond) {
        if (node.sign == false)
            throw IllegalMove("Operation can only be applied in DIAMOND if the sign is True")
        var childFormula = formula.child

        var nu0 = SignedModalTableauxNode(leafID, newPrefix, true, childFormula)
        nodes.add(nu0)
        leaf.children.add(nodes.size - 1)
    } else {
        throw IllegalMove("Pi Rule can not be applied on the node $node")
    }

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

    return applyPruneRecursive(state, nodeID)
}

/**
 * Prune all the children of the given node.
 * @param state: SignedModalTableaux state to apply move on
 * @param nodeID: ID of node to apply move on
 * @return new state after applying move
 */
@Suppress("ComplexMethod", "EmptyCatchBlock", "NestedBlockDepth")
fun applyPruneRecursive(state: SignedModalTableauxState, nodeID: Int): SignedModalTableauxState {
    val nodes = state.nodes

    val node = nodes[nodeID]

    if (nodes.size <= 1)
        throw IllegalMove("Nothing to Prune")

    if (node.isLeaf)
        throw IllegalMove("Nothing to Prune")

    for (child: Int in node.children) {
        try {
            applyPruneRecursive(state, child)
        } catch (e: IllegalMove) {
        }
        nodes.removeAt(child)
        // Update left side of removalNode 
        for (i in 0..(child - 1)) {
            var currentNode = nodes.elementAt(i)

            for (j in 0..(currentNode.children.size - 1)) {
                if (currentNode.children[j] > child)
                    currentNode.children[j] -= 1
            }

            if (currentNode.closeRef != null && currentNode.closeRef!! > child)
                currentNode.closeRef = currentNode.closeRef!! - 1
        }
        // Update right side of removalNode
        for (i in child..(nodes.size - 1)) {
            var currentNode = nodes.elementAt(i)

            for (j in 0..(currentNode.children.size - 1)) {
                currentNode.children[j] -= 1
                if (currentNode.parent != null && currentNode.parent!! > child)
                    currentNode.parent = currentNode.parent!! - 1
            }

            if (currentNode.closeRef != null && currentNode.closeRef!! > child)
                currentNode.closeRef = currentNode.closeRef!! - 1
        }
    }
    node.children.clear()
    node.isClosed = false

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
    val nodes = state.nodes

    if (closeID < nodeID) {
        return applyClose(state, closeID, nodeID)
    }

    checkCloseIDRestrictions(state, nodeID, closeID)

    val node = nodes[nodeID]
    val leaf = nodes[closeID]

    if (node.sign == leaf.sign)
        throw IllegalMove("The selected formulas are not of opposite sign.")

    if (!node.prefix.equals(leaf.prefix))
        throw IllegalMove("The selected formulas do not have the same prefix.")

    if (!node.formula.synEq(leaf.formula))
        throw IllegalMove("The selected formula is not syntactically equivalent.")

    // node.closeRef = closeID
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
    val nodes = state.nodes

    checkNodeRestrictions(nodes, nodeID)

    if (closeID >= nodes.size || closeID < 0)
        throw IllegalMove("Node with ID $closeID does not exist")

    val node = state.nodes[nodeID]
    val closeNode = state.nodes[closeID]
    // Verify that closeNode is transitive parent of node
    if (!state.nodeIsParentOf(nodeID, closeID))
        throw IllegalMove("Node '$closeNode' is not an ancestor of node '$node'")
}

/**
 * Check nodeID valid + already closed
 */
fun checkNodeRestrictions(nodes: List<SignedModalTableauxNode>, nodeID: Int) {
    if (nodeID < 0 || nodeID >= nodes.size)
        throw IllegalMove("Node with ID $nodeID does not exist")
    // Verify that node is not already closed
    val node = nodes[nodeID]
    if (node.isClosed)
        throw IllegalMove("Node '$node' is already closed")
}
