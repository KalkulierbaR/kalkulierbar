package kalkulierbar.sequent

import kalkulierbar.IllegalMove
import kalkulierbar.logic.And
import kalkulierbar.logic.Impl
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or

/**
 * Rule Ax is applied, if formulas of the same kind are on both sides of the Node.
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @return new state after applying move
 */
@Suppress("ThrowsCount")
fun applyAx(
    state: GenericSequentCalculusState,
    nodeID: Int,
): GenericSequentCalculusState {
    state.checkNodeID(nodeID)
    val leaf = state.tree[nodeID]

    if (!leaf.isLeaf) {
        throw IllegalMove("Rules must be applied on leaf level")
    }
    for (leftFormula in leaf.leftFormulas) {
        if (leaf.rightFormulas.any { it.synEq(leftFormula) }) {
            val newLeaf =
                TreeNode(
                    nodeID,
                    mutableListOf(),
                    mutableListOf(),
                    mutableListOf(),
                    true,
                    Ax(nodeID),
                )
            state.addChildren(nodeID, newLeaf)
            state.setNodeClosed(newLeaf)
            return state
        }
    }
    throw IllegalMove("Axiom rule needs two identical formulas on both sides to be applied")
}

/**
 * Rule NotRight is applied, if the LogicNode is in RightFormula of the Node and is of type NOT  .
 * The LogicNode on which the NotRight is applied, will be moved to the leftFormula of Node
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(LogicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyNotRight(
    state: GenericSequentCalculusState,
    nodeID: Int,
    listIndex: Int,
): GenericSequentCalculusState {
    checkRight(state, nodeID, listIndex)

    val leaf = state.tree[nodeID]
    val formula = leaf.rightFormulas[listIndex]

    if (formula !is Not) {
        throw IllegalMove("Rule notRight can only be applied on a negation")
    }
    val newLeftFormula = leaf.leftFormulas.toMutableList()
    newLeftFormula.add(formula.child)
    val newRightFormula = leaf.rightFormulas.toMutableList()
    newRightFormula.removeAt(listIndex)

    val newLeaf =
        TreeNode(
            nodeID,
            newLeftFormula.distinct().toMutableList(),
            newRightFormula.distinct().toMutableList(),
            NotRight(nodeID, listIndex),
        )
    state.addChildren(nodeID, newLeaf)
    return state
}

/**
 * Rule NotLeft is applied, if the LogicNode is LeftFormula of Node and is of type NOT  .
 * The LogicNode on which the NotLeft is applied, will be moved to the rightFormula of the Node
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyNotLeft(
    state: GenericSequentCalculusState,
    nodeID: Int,
    listIndex: Int,
): GenericSequentCalculusState {
    checkLeft(state, nodeID, listIndex)

    val leaf = state.tree[nodeID]
    val formula = leaf.leftFormulas[listIndex]

    if (formula !is Not) {
        throw IllegalMove("Rule notLeft can only be applied on a negation")
    }
    val newLeftFormula = leaf.leftFormulas.toMutableList()
    newLeftFormula.removeAt(listIndex)
    val newRightFormula = leaf.rightFormulas.toMutableList()
    newRightFormula.add(formula.child)

    val newLeaf =
        TreeNode(
            nodeID,
            newLeftFormula.distinct().toMutableList(),
            newRightFormula.distinct().toMutableList(),
            NotLeft(nodeID, listIndex),
        )
    state.addChildren(nodeID, newLeaf)
    return state
}

/**
 * Rule OrRight is applied, if the LogicNode is in rightFormula of Node and is of type OR  .
 * The left and right formula of the logicNode will be separated and added to the right formula of the Node
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyOrRight(
    state: GenericSequentCalculusState,
    nodeID: Int,
    listIndex: Int,
): GenericSequentCalculusState {
    checkRight(state, nodeID, listIndex)

    val leaf = state.tree[nodeID]
    val formula = leaf.rightFormulas[listIndex]

    if (formula !is Or) {
        throw IllegalMove("Rule orRight can only be applied on a disjunction")
    }
    val newLeftFormula = leaf.leftFormulas.toMutableList()
    val newRightFormula = leaf.rightFormulas.toMutableList()
    newRightFormula.removeAt(listIndex)
    newRightFormula.add(listIndex, formula.leftChild)
    newRightFormula.add(listIndex + 1, formula.rightChild)
    val newLeaf =
        TreeNode(
            nodeID,
            newLeftFormula.distinct().toMutableList(),
            newRightFormula.distinct().toMutableList(),
            OrRight(nodeID, listIndex),
        )
    state.addChildren(nodeID, newLeaf)
    return state
}

/**
 * Rule OrLeft is applied, if the LogicNode is in LeftFormula of Node and is of type Or.
 * Node will be split into 2 Nodes.
 *    LeftNode: RightChild of LeftNode will be same as RightChild of the Node.
 *            : LeftChild of LeftNode will have LeftChild of the LogicNode and LeftChild of the Node.
 *    RightNode: RightChild of RightNode will be same as RightChild of the Node.
 *            : LeftChild of RightNode will have RightChild of the LogicNode and LeftChild of the Node.
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyOrLeft(
    state: GenericSequentCalculusState,
    nodeID: Int,
    listIndex: Int,
): GenericSequentCalculusState {
    checkLeft(state, nodeID, listIndex)

    val leaf = state.tree[nodeID]
    val formula = leaf.leftFormulas[listIndex]

    if (formula !is Or) {
        throw IllegalMove("Rule orLeft can only be applied on a disjunction")
    }
    val newLeftFormulaOnLeftChild = leaf.leftFormulas.toMutableList()
    newLeftFormulaOnLeftChild.removeAt(listIndex)
    newLeftFormulaOnLeftChild.add(listIndex, formula.leftChild)
    val newRightFormulaOnLeftChild = leaf.rightFormulas.toMutableList()

    val newLeftFormulaOnRightChild = leaf.leftFormulas.toMutableList()
    newLeftFormulaOnRightChild.removeAt(listIndex)
    newLeftFormulaOnRightChild.add(listIndex, formula.rightChild)
    val newRightFormulaOnRightChild = leaf.rightFormulas.toMutableList()

    val newLeftLeaf =
        TreeNode(
            nodeID,
            newLeftFormulaOnLeftChild.distinct().toMutableList(),
            newRightFormulaOnLeftChild.distinct().toMutableList(),
            OrLeft(nodeID, listIndex),
        )
    val newRightLeaf =
        TreeNode(
            nodeID,
            newLeftFormulaOnRightChild.distinct().toMutableList(),
            newRightFormulaOnRightChild.distinct().toMutableList(),
            OrLeft(nodeID, listIndex),
        )

    state.addChildren(nodeID, newLeftLeaf, newRightLeaf)
    return state
}

/**
 * Rule AndRight is applied, if the LogicNode is in RightFormula of Node and  is of type AND.
 * Node will be split into 2 Nodes.
 *    LeftNode: LeftChild of LeftNode will be same as LeftChild of the Node.
 *            : RightChild of LeftNode will have LeftChild of the LogicNode and RightChild of the Node.
 *    RightNode: LeftChild of RightNode will be same as LeftChild of the Node.
 *            : RightChild of RightNode will have RightChild of the LogicNode and RightChild of the Node.
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(LogicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyAndRight(
    state: GenericSequentCalculusState,
    nodeID: Int,
    listIndex: Int,
): GenericSequentCalculusState {
    checkRight(state, nodeID, listIndex)

    val leaf = state.tree[nodeID]
    val formula = leaf.rightFormulas[listIndex]

    if (formula !is And) {
        throw IllegalMove("Rule andRight can only be applied on a conjunction")
    }
    val newLeftFormulaOnLeftChild = leaf.leftFormulas.toMutableList()
    val newRightFormulaOnLeftChild = leaf.rightFormulas.toMutableList()
    newRightFormulaOnLeftChild.removeAt(listIndex)
    newRightFormulaOnLeftChild.add(listIndex, formula.leftChild)

    val newLeftFormulaOnRightChild = leaf.leftFormulas.toMutableList()
    val newRightFormulaOnRightChild = leaf.rightFormulas.toMutableList()
    newRightFormulaOnRightChild.removeAt(listIndex)
    newRightFormulaOnRightChild.add(listIndex, formula.rightChild)

    val newLeftLeaf =
        TreeNode(
            nodeID,
            newLeftFormulaOnLeftChild.distinct().toMutableList(),
            newRightFormulaOnLeftChild.distinct().toMutableList(),
            AndRight(nodeID, listIndex),
        )
    val newRightLeaf =
        TreeNode(
            nodeID,
            newLeftFormulaOnRightChild.distinct().toMutableList(),
            newRightFormulaOnRightChild.distinct().toMutableList(),
            AndRight(nodeID, listIndex),
        )
    state.addChildren(nodeID, newLeftLeaf, newRightLeaf)

    return state
}

/**
 * Rule AndLeft is applied, if LogicNode is in LeftFormula of Node and is of type AND.
 * The left and right formula of the logicNode will be separated and added to the left Child of the node,
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(LogicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyAndLeft(
    state: GenericSequentCalculusState,
    nodeID: Int,
    listIndex: Int,
): GenericSequentCalculusState {
    checkLeft(state, nodeID, listIndex)

    val leaf = state.tree[nodeID]
    val formula = leaf.leftFormulas[listIndex]

    if (formula !is And) {
        throw IllegalMove("Rule andLeft can only be applied on a conjunction")
    }
    val newLeftFormula = leaf.leftFormulas.toMutableList()
    newLeftFormula.removeAt(listIndex)
    newLeftFormula.add(listIndex, formula.leftChild)
    newLeftFormula.add(listIndex + 1, formula.rightChild)
    val newRightFormula = leaf.rightFormulas.toMutableList()
    val newLeaf =
        TreeNode(
            nodeID,
            newLeftFormula.distinct().toMutableList(),
            newRightFormula.distinct().toMutableList(),
            AndLeft(nodeID, listIndex),
        )
    state.addChildren(nodeID, newLeaf)
    return state
}

/**
 * Rule ImpLeft is applied, if the LogicNode is the leftChild of node and is of type IMPL (Implication).
 * Node will be split into 2 nodes:
 *  LeftNode: LeftChild of LeftNode will be same as leftChild of Node. (except the logicNode)
 *            RightChild of LeftNode will be same as rightChild of Node + LeftChild of logicNode
 *  RightNode: LeftChild of RightNode will be same as leftChild of Node + RightChild of logicNode
 *             RightChild of RightNode will same as rightChild of Node.
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyImpLeft(
    state: GenericSequentCalculusState,
    nodeID: Int,
    listIndex: Int,
): GenericSequentCalculusState {
    checkLeft(state, nodeID, listIndex)

    val leaf = state.tree[nodeID]
    val formula = leaf.leftFormulas[listIndex]

    if (formula !is Impl) {
        throw IllegalMove("Rule impLeft can only be applied on an implication")
    }
    val newLeftFormulaOnLeftChild = leaf.leftFormulas.toMutableList()
    newLeftFormulaOnLeftChild.removeAt(listIndex)
    val newRightFormulaOnLeftChild = leaf.rightFormulas.toMutableList()
    newRightFormulaOnLeftChild.add(formula.leftChild)

    val newLeftFormulaOnRightChild = leaf.leftFormulas.toMutableList()
    newLeftFormulaOnRightChild.removeAt(listIndex)
    newLeftFormulaOnRightChild.add(formula.rightChild)
    val newRightFormulaOnRightChild = leaf.rightFormulas.toMutableList()
    val newLeftLeaf =
        TreeNode(
            nodeID,
            newLeftFormulaOnLeftChild.distinct().toMutableList(),
            newRightFormulaOnLeftChild.distinct().toMutableList(),
            ImpLeft(nodeID, listIndex),
        )
    val newRightLeaf =
        TreeNode(
            nodeID,
            newLeftFormulaOnRightChild.distinct().toMutableList(),
            newRightFormulaOnRightChild.distinct().toMutableList(),
            ImpLeft(nodeID, listIndex),
        )

    state.addChildren(nodeID, newLeftLeaf, newRightLeaf)
    return state
}

/**
 * Rule ImpRight is applied, if the LogicNode is RightFormula of node and is of type IMPL (Implication).
 * The leftChild of the logicNode will be moved to the leftChild of the Node,
 * The rightChild of the logicNode will be moved to the rightChild of the Node.
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyImpRight(
    state: GenericSequentCalculusState,
    nodeID: Int,
    listIndex: Int,
): GenericSequentCalculusState {
    checkRight(state, nodeID, listIndex)

    val leaf = state.tree[nodeID]
    val formula = leaf.rightFormulas[listIndex]

    if (formula !is Impl) {
        throw IllegalMove("Rule impRight can only be applied on an implication")
    }
    val newLeftFormula = leaf.leftFormulas.toMutableList()
    newLeftFormula.add(formula.leftChild)
    val newRightFormula = leaf.rightFormulas.toMutableList()
    newRightFormula.removeAt(listIndex)
    newRightFormula.add(listIndex, formula.rightChild)
    val newLeaf =
        TreeNode(
            nodeID,
            newLeftFormula.distinct().toMutableList(),
            newRightFormula.distinct().toMutableList(),
            ImpRight(nodeID, listIndex),
        )
    state.addChildren(nodeID, newLeaf)
    return state
}

/**
 * Check the following restrictions:
 *      1) If the nodeID is within the tree
 *      2) If the given node is a leaf
 *      3) If the logicNode is within the the right formula of the NOde
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 */
@Suppress("ThrowsCount")
fun checkRight(
    state: GenericSequentCalculusState,
    nodeID: Int,
    listIndex: Int,
) {
    state.checkNodeID(nodeID)
    val leaf = state.tree[nodeID]

    if (!leaf.isLeaf) {
        throw IllegalMove("Rules can only be applied on leaf level")
    } else if (listIndex < 0 || leaf.rightFormulas.size <= listIndex) {
        throw IllegalMove("listIndex out of bounds")
    }
}

/**
 * Check the following restrictions:
 *      1) If the nodeID is within the tree
 *      2) If the given node is a leaf
 *      3) If the logicNode is within the the left formula of the Node
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 */
@Suppress("ThrowsCount")
fun checkLeft(
    state: GenericSequentCalculusState,
    nodeID: Int,
    listIndex: Int,
) {
    state.checkNodeID(nodeID)
    val leaf = state.tree[nodeID]

    if (!leaf.isLeaf) {
        throw IllegalMove("Rules can only be applied on leaf level")
    } else if (listIndex < 0 || leaf.leftFormulas.size <= listIndex) {
        throw IllegalMove("listIndex out of bounds")
    }
}

/**
 * Undo a rule application by re-building the state from the move history
 * @param state State in which to apply the undo
 * @return Equivalent state with the most recent rule application removed
 */
fun applyUndo(state: GenericSequentCalculusState): GenericSequentCalculusState {
    if (state.tree.size <= 1) {
        throw IllegalMove("No move to undo")
    }
    val latestNode = state.tree.elementAt(state.tree.size - 1)

    if (!latestNode.isLeaf) {
        throw IllegalMove("Rules can only be applied on leaf level")
    }
    val parentID: Int? = latestNode.parent
    val parentNode = state.tree.elementAt(parentID!!)

    state.pruneBranch(parentID)

    var currentNode = parentNode
    parentNode.isClosed = false
    while (currentNode.parent != null) {
        currentNode = state.tree.elementAt(currentNode.parent!!)
        currentNode.isClosed = false
    }
    return state
}

/**
 * Prune all the children of the given node.
 * @param state: GenericSequentCalculus state to apply move on
 * @param nodeID: ID of node to apply move on
 * @return new state after applying move
 */
fun applyPrune(
    state: GenericSequentCalculusState,
    nodeID: Int,
): GenericSequentCalculusState {
    state.checkNodeID(nodeID)
    state.pruneBranch(nodeID)
    return state
}
