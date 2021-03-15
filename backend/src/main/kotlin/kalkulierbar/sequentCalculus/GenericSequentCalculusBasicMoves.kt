package kalkulierbar.sequentCalculus.moveImplementations

import kalkulierbar.IllegalMove
import kalkulierbar.logic.*
import kalkulierbar.sequentCalculus.*
import kalkulierbar.sequentCalculus.GenericSequentCalculusState
import kalkulierbar.sequentCalculus.TreeNode
/**
 * Rule Ax is applied, if formulas of the same kind are on both sides of the Node.
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @return new state after applying move
 */
@Suppress("ThrowsCount")
fun applyAx(state: GenericSequentCalculusState, nodeID: Int): GenericSequentCalculusState {

    if (nodeID < 0 || state.tree.size <= nodeID)
        throw IllegalMove("nodeID out of bounds.")

    var leaf = state.tree[nodeID]

    if (!leaf.isLeaf)
        throw IllegalMove("Rules must be applied on leaf level.")

    for (leftFormula in leaf.leftFormulas) {
        if (leaf.rightFormulas.find { elem -> elem.synEq(leftFormula) } != null) {
            val newLeaf = TreeNode(
                nodeID,
                emptyArray(),
                mutableListOf<LogicNode>(),
                mutableListOf<LogicNode>(),
                true,
                Ax(nodeID)
            )
            state.tree.add(newLeaf)
            state.tree[nodeID].children = arrayOf(state.tree.size - 1)
            state.setNodeClosed(newLeaf)
            return state
        }
    }
    throw IllegalMove("Rule 'Ax' needs two formulas of the same kind on both sides to be applied.")
}

/**
 * Rule NotRight is applied, if the LogicNode is in RightFormula of the Node and is of type NOT  .
 * The LogicNode on which the NotRight is applied, will be moved to the leftFormula of Node
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(LogicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyNotRight(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkRight(state, nodeID, listIndex)

    var leaf = state.tree[nodeID]
    val formula = leaf.rightFormulas.get(listIndex)

    if (formula !is Not)
        throw IllegalMove("The rule notRight must be applied on '¬'")

    val newLeftFormula = leaf.leftFormulas.toMutableList()
    newLeftFormula.add(formula.child)
    val newRightFormula = leaf.rightFormulas.toMutableList()
    newRightFormula.removeAt(listIndex)

    var newLeaf = TreeNode(
        nodeID,
        newLeftFormula.distinct().toMutableList(),
        newRightFormula.distinct().toMutableList(),
        NotRight(nodeID, listIndex)
    )
    state.tree.add(newLeaf)
    state.tree[nodeID].children = arrayOf(state.tree.size - 1)
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
fun applyNotLeft(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkLeft(state, nodeID, listIndex)

    var leaf = state.tree[nodeID]

    val formula = leaf.leftFormulas.get(listIndex)

    if (formula !is Not)
        throw IllegalMove("The rule notLeft must be applied on '¬'")

    val newLeftFormula = leaf.leftFormulas.toMutableList()
    newLeftFormula.removeAt(listIndex)
    val newRightFormula = leaf.rightFormulas.toMutableList()
    newRightFormula.add(formula.child)

    var newLeaf = TreeNode(
        nodeID,
        newLeftFormula.distinct().toMutableList(),
        newRightFormula.distinct().toMutableList(),
        NotLeft(nodeID, listIndex)
    )
    state.tree.add(newLeaf)
    state.tree[nodeID].children = arrayOf(state.tree.size - 1)
    return state
}

/**
 * Rule OrRight is applied, if the LogicNode is in rightFormula of Node and is of type OR  .
 * The left and right formula of the logicNode will be seperated and added to the right formula of the Node
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyOrRight(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkRight(state, nodeID, listIndex)

    var leaf = state.tree[nodeID]
    val formula = leaf.rightFormulas.get(listIndex)

    if (formula !is Or)
        throw IllegalMove("The rule orRight must be applied on '∨' ")

    val newLeftFormula = leaf.leftFormulas.toMutableList()
    val newRightFormula = leaf.rightFormulas.toMutableList()
    newRightFormula.removeAt(listIndex)
    newRightFormula.add(listIndex, formula.leftChild)
    newRightFormula.add(listIndex + 1, formula.rightChild)
    val newLeaf = TreeNode(
        nodeID,
        newLeftFormula.distinct().toMutableList(),
        newRightFormula.distinct().toMutableList(),
        OrRight(nodeID, listIndex)
    )
    state.tree.add(newLeaf)
    state.tree[nodeID].children = arrayOf(state.tree.size - 1)
    return state
}

/**
 * Rule OrLeft is applied, if the LogicNode is in LeftFormula of Node and is of type Or.
 * Node will be splited into 2 Nodes.
 *    LeftNode: RightChild of LeftNode will be same as RightChild of the Node.
 *            : LeftChild of LeftNode will have LeftChild of the LogicNode and LeftChild of the Node.
 *    RightNode: RightChild of RightNode will be same as RightChild of the Node.
 *            : LeftChild of RightNode will have RightChild of the LogicNode and LeftChild of the Node.
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyOrLeft(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkLeft(state, nodeID, listIndex)

    var leaf = state.tree[nodeID]
    val formula = leaf.leftFormulas.get(listIndex)

    if (formula !is Or)
        throw IllegalMove("The rule orLeft must be applied on a '∨' ")

    val newLeftFormulaOnLeftChild = leaf.leftFormulas.toMutableList()
    newLeftFormulaOnLeftChild.removeAt(listIndex)
    newLeftFormulaOnLeftChild.add(listIndex, formula.leftChild)
    val newRightFormulaOnLeftChild = leaf.rightFormulas.toMutableList()

    val newLeftFormulaOnRightChild = leaf.leftFormulas.toMutableList()
    newLeftFormulaOnRightChild.removeAt(listIndex)
    newLeftFormulaOnRightChild.add(listIndex, formula.rightChild)
    val newRightFormulaOnRightChild = leaf.rightFormulas.toMutableList()

    val newLeftLeaf = TreeNode(
        nodeID,
        newLeftFormulaOnLeftChild.distinct().toMutableList(),
        newRightFormulaOnLeftChild.distinct().toMutableList(),
        OrLeft(nodeID, listIndex)
    )
    val newRightLeaf = TreeNode(
        nodeID,
        newLeftFormulaOnRightChild.distinct().toMutableList(),
        newRightFormulaOnRightChild.distinct().toMutableList(),
        OrLeft(nodeID, listIndex)
    )

    state.tree.add(newLeftLeaf)
    state.tree.add(newRightLeaf)
    state.tree[nodeID].children = arrayOf(state.tree.size - 2, state.tree.size - 1)
    return state
}

/**
 * Rule AndRight is applied, if the LogicNode is in RightFormula of Node and  is of type AND.
 * Node will be splited into 2 Nodes.
 *    LeftNode: LeftChild of LeftNode will be same as LeftChild of the Node.
 *            : RightChild of LeftNode will have LeftChild of the LogicNode and RightChild of the Node.
 *    RightNode: LeftChild of RightNode will be same as LeftChild of the Node.
 *            : RightChild of RightNode will have RightChild of the LogicNode and RightChild of the Node.
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(LogicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyAndRight(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkRight(state, nodeID, listIndex)

    var leaf = state.tree[nodeID]
    val formula = leaf.rightFormulas.get(listIndex)

    if (formula !is And)
        throw IllegalMove("The rule andRight must be applied on a '∧'")

    val newLeftFormulaOnLeftChild = leaf.leftFormulas.toMutableList()
    val newRightFormulaOnLeftChild = leaf.rightFormulas.toMutableList()
    newRightFormulaOnLeftChild.removeAt(listIndex)
    newRightFormulaOnLeftChild.add(listIndex, formula.leftChild)

    val newLeftFormulaOnRightChild = leaf.leftFormulas.toMutableList()
    val newRightFormulaOnRightChild = leaf.rightFormulas.toMutableList()
    newRightFormulaOnRightChild.removeAt(listIndex)
    newRightFormulaOnRightChild.add(listIndex, formula.rightChild)

    val newLeftLeaf = TreeNode(
        nodeID,
        newLeftFormulaOnLeftChild.distinct().toMutableList(),
        newRightFormulaOnLeftChild.distinct().toMutableList(),
        AndRight(nodeID, listIndex)
    )
    val newRightLeaf = TreeNode(
        nodeID,
        newLeftFormulaOnRightChild.distinct().toMutableList(),
        newRightFormulaOnRightChild.distinct().toMutableList(),
        AndRight(nodeID, listIndex)
    )
    state.tree.add(newLeftLeaf)
    state.tree.add(newRightLeaf)
    state.tree[nodeID].children = arrayOf(state.tree.size - 2, state.tree.size - 1)
    return state
}

/**
 * Rule AndLeft is applied, if LogicNode is in LeftFormula of Node and is of type AND.
 * The left and right formula of the logicNode will be seperated and added to the left Child of the node,
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(LogicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyAndLeft(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkLeft(state, nodeID, listIndex)

    var leaf = state.tree[nodeID]
    val formula = leaf.leftFormulas.get(listIndex)

    if (formula !is And)
        throw IllegalMove("The rule andLeft must be applied on a '∧'")

    val newLeftFormula = leaf.leftFormulas.toMutableList()
    newLeftFormula.removeAt(listIndex)
    newLeftFormula.add(listIndex, formula.leftChild)
    newLeftFormula.add(listIndex + 1, formula.rightChild)
    val newRightFormula = leaf.rightFormulas.toMutableList()
    val newLeaf = TreeNode(
        nodeID,
        newLeftFormula.distinct().toMutableList(),
        newRightFormula.distinct().toMutableList(),
        AndLeft(nodeID, listIndex)
    )
    state.tree.add(newLeaf)
    state.tree[nodeID].children = arrayOf(state.tree.size - 1)
    return state
}

/**
 * Rule ImpLeft is applied, if the LogicNode is the leftChild of node and is of type IMPL (Implication).
 * Node will be splitted into 2 nodes:
 *  LeftNode: LeftChild of LeftNode will be same as leftChild of Node. (except the logicNode)
 *            RightChild of LeftNode will be same as rightChild of Node + LeftChild of logicNode
 *  RightNode: LeftChild of RightNode will be same as leftChild of Node + RightChild of logicNode
 *             RightChild of RightNode will same as rightChild of Node.
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyImpLeft(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkLeft(state, nodeID, listIndex)

    var leaf = state.tree[nodeID]
    val formula = leaf.leftFormulas.get(listIndex)

    if (formula !is Impl)
        throw IllegalMove("The rule impLeft must be applied on a '→' ")
    val newLeftFormulaOnLeftChild = leaf.leftFormulas.toMutableList()
    newLeftFormulaOnLeftChild.removeAt(listIndex)
    val newRightFormulaOnLeftChild = leaf.rightFormulas.toMutableList()
    newRightFormulaOnLeftChild.add(formula.leftChild)

    val newLeftFormulaOnRightChild = leaf.leftFormulas.toMutableList()
    newLeftFormulaOnRightChild.removeAt(listIndex)
    newLeftFormulaOnRightChild.add(formula.rightChild)
    val newRightFormulaOnRightChild = leaf.rightFormulas.toMutableList()
    val newLeftLeaf = TreeNode(
        nodeID,
        newLeftFormulaOnLeftChild.distinct().toMutableList(),
        newRightFormulaOnLeftChild.distinct().toMutableList(),
        ImpLeft(nodeID, listIndex)
    )
    val newRightLeaf = TreeNode(
        nodeID,
        newLeftFormulaOnRightChild.distinct().toMutableList(),
        newRightFormulaOnRightChild.distinct().toMutableList(),
        ImpLeft(nodeID, listIndex)
    )

    state.tree.add(newLeftLeaf)
    state.tree.add(newRightLeaf)
    state.tree[nodeID].children = arrayOf(state.tree.size - 2, state.tree.size - 1)
    return state
}

/**
 * Rule ImpRight is applied, if the LogicNode is RightFormula of node and is of type IMPL (Implication).
 * The leftChild of the logicNode will moved to the leftChild of the Node,
 * The rightChild of the logicNode will be moved to the rightChild of the Node.
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @return new state after applying move
 */
fun applyImpRight(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkRight(state, nodeID, listIndex)

    var leaf = state.tree[nodeID]
    val formula = leaf.rightFormulas.get(listIndex)

    if (formula !is Impl)
        throw IllegalMove("The rule ImpRight must be applied on a '→' ")
    val newLeftFormula = leaf.leftFormulas.toMutableList()
    newLeftFormula.add(formula.leftChild)
    val newRightFormula = leaf.rightFormulas.toMutableList()
    newRightFormula.removeAt(listIndex)
    newRightFormula.add(listIndex, formula.rightChild)
    val newLeaf = TreeNode(
        nodeID,
        newLeftFormula.distinct().toMutableList(),
        newRightFormula.distinct().toMutableList(),
        ImpRight(nodeID, listIndex)
    )
    state.tree.add(newLeaf)
    state.tree[nodeID].children = arrayOf(state.tree.size - 1)
    return state
}

/**
 * Check the following ristrictions:
 *      1) If the nodeID is within the tree
 *      2) If the given node is a leaf
 *      3) If the logicNode is within the the right formula of the NOde
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 */
@Suppress("ThrowsCount")
fun checkRight(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int) {
    if (nodeID < 0 || state.tree.size <= nodeID)
        throw IllegalMove("nodeID out of Bounds")

    var leaf = state.tree[nodeID]

    if (!leaf.isLeaf)
        throw IllegalMove("Rules can only be applied on Leaf level.")

    if (listIndex < 0 || leaf.rightFormulas.size <= listIndex)
        throw IllegalMove("listIndex out of Bounds.")

    return
}

/**
 * Check the following ristrictions:
 *      1) If the nodeID is within the tree
 *      2) If the given node is a leaf
 *      3) If the logicNode is within the the leftformula of the Node
 * @param state: GenericSequentCalculusState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 */
@Suppress("ThrowsCount")
fun checkLeft(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int) {
    if (nodeID < 0 || state.tree.size <= nodeID)
        throw IllegalMove("nodeID out of Bounds")

    var leaf = state.tree[nodeID]

    if (!leaf.isLeaf)
        throw IllegalMove("Rules can only be applied on Leaf level.")

    if (listIndex < 0 || leaf.leftFormulas.size <= listIndex)
        throw IllegalMove("listIndex out of Bounds.")

    return
}

/**
 * Undo a rule application by re-building the state from the move history
 * @param state State in which to apply the undo
 * @return Equivalent state with the most recent rule application removed
 */
fun applyUndo(state: GenericSequentCalculusState): GenericSequentCalculusState {
    if (state.tree.size <= 1)
        throw IllegalMove("No move to undo")

    val latestNode = state.tree.elementAt(state.tree.size - 1)

    if (!latestNode.isLeaf)
        throw IllegalMove("Rules can only be applied on Leaf level.")

    val parentID: Int? = latestNode.parent

    val parentNode = state.tree.elementAt(parentID!!)

    applyPrune(state, parentID)

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
@Suppress("EmptyCatchBlock", "ComplexMethod", "NestedBlockDepth", "ThrowsCount")
fun applyPrune(state: GenericSequentCalculusState, nodeID: Int): GenericSequentCalculusState {
    if (nodeID < 0 || state.tree.size <= nodeID)
        throw IllegalMove("nodeID out of Bounds")

    if (state.tree.size <= 1)
        throw IllegalMove("Nothing to Prune")

    val node = state.tree.elementAt(nodeID)

    if (node.isLeaf)
        throw IllegalMove("Nothing to Prune")

    for (child: Int in node.children) {
        try {
            applyPrune(state, child)
        } catch (e: IllegalMove) {
        }
        state.tree.removeAt(child)
        // Update left side of removalNode 
        for (i in 0..(child - 1)) {
            var currentNode = state.tree.elementAt(i)

            for (j in 0..(currentNode.children.size - 1)) {
                if (currentNode.children[j] > child)
                    currentNode.children[j] -= 1
            }
        }
        // Update right side of removalNode
        for (i in child..(state.tree.size - 1)) {
            var currentNode = state.tree.elementAt(i)

            for (j in 0..(currentNode.children.size - 1)) {
                currentNode.children[j] -= 1
                if (currentNode.parent != null && currentNode.parent!! > child)
                    currentNode.parent = currentNode.parent!! - 1
            }
        }
    }
    node.children = emptyArray<Int>()
    node.isClosed = false
    return state
}
