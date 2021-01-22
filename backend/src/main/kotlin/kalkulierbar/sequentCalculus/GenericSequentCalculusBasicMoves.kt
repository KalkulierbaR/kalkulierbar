package kalkulierbar.sequentCalculus.moveImplementations

import kalkulierbar.IllegalMove
import kalkulierbar.logic.And
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.UnaryOp
import java.io.Console

import kalkulierbar.sequentCalculus.GenericSequentCalculusState
import kalkulierbar.sequentCalculus.GenericSequentCalculusNode
import kalkulierbar.sequentCalculus.*

import kalkulierbar.sequentCalculus.TreeNode

fun applyAx(state: GenericSequentCalculusState, nodeID: Int) : GenericSequentCalculusState {

    if (nodeID < 0 || state.tree.size <= nodeID)
        throw IllegalMove("nodeID out of bounds.")
    
    var leaf = state.tree[nodeID];
    
    if (!leaf.isLeaf)
        throw IllegalMove("Rules must be applied on leaf level.")

    for (leftFormula in leaf.leftFormulas) {
        if (leaf.rightFormulas.find { elem -> elem.synEq(leftFormula) } != null) {
            val newLeaf = TreeNode(nodeID, emptyArray(), mutableListOf<LogicNode>(), mutableListOf<LogicNode>(), true, Ax(nodeID));
            state.tree.add(newLeaf);
            state.tree[nodeID].children = arrayOf(state.tree.size - 1);
            state.setNodeClosed(newLeaf);
            return state;
        }
    }    
    throw IllegalMove("Rule 'Ax' needs two nodes of the same kind on both sides to be applied.")
}

fun applyNotRight(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkRight(state, nodeID, listIndex)

    var leaf = state.tree[nodeID];
    val formula = leaf.rightFormulas.get(listIndex)

    if (formula !is Not)
        throw IllegalMove("The rule notRight must be applied on '¬'")
        
    val newLeftFormula = leaf.leftFormulas.toMutableList();
    newLeftFormula.add(formula.child);
    val newRightFormula = leaf.rightFormulas.toMutableList();
    newRightFormula.removeAt(listIndex);

    var newLeaf = TreeNode(nodeID, newLeftFormula.distinct().toMutableList(), newRightFormula.distinct().toMutableList(), NotRight(nodeID, listIndex))
    state.tree.add(newLeaf);
    state.tree[nodeID].children = arrayOf(state.tree.size - 1);
    return state;
}

fun applyNotLeft(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkLeft(state, nodeID, listIndex)

    var leaf = state.tree[nodeID];

    val formula = leaf.leftFormulas.get(listIndex)

    if (formula !is Not)
        throw IllegalMove("The rule notLeft must be applied on '¬'")
        
    val newLeftFormula = leaf.leftFormulas.toMutableList();
    newLeftFormula.removeAt(listIndex);
    val newRightFormula = leaf.rightFormulas.toMutableList();
    newRightFormula.add(formula.child);

    var newLeaf = TreeNode(nodeID, newLeftFormula.distinct().toMutableList(), newRightFormula.distinct().toMutableList(), NotLeft(nodeID, listIndex))
    state.tree.add(newLeaf);
    state.tree[nodeID].children = arrayOf(state.tree.size - 1);
    return state;
}

fun applyOrRight(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkRight(state, nodeID, listIndex)

    var leaf = state.tree[nodeID]
    val formula = leaf.rightFormulas.get(listIndex);

    if (formula !is Or)
        throw IllegalMove("The rule orRight must be applied on '∨' ")

    val newLeftFormula = leaf.leftFormulas.toMutableList();
    val newRightFormula = leaf.rightFormulas.toMutableList();
    newRightFormula.removeAt(listIndex)
    newRightFormula.add(listIndex,formula.leftChild)
    newRightFormula.add(listIndex + 1, formula.rightChild)
    val newLeaf = TreeNode(nodeID, newLeftFormula.distinct().toMutableList(), newRightFormula.distinct().toMutableList(), OrRight(nodeID, listIndex));
    state.tree.add(newLeaf)
    state.tree[nodeID].children = arrayOf(state.tree.size - 1);
    return state;
}

fun applyOrLeft(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkLeft(state, nodeID, listIndex)

    var leaf = state.tree[nodeID]
    val formula = leaf.leftFormulas.get(listIndex);

    if (formula !is Or)
        throw IllegalMove("The rule orLeft must be applied on a '∨' ")

    val newLeftFormulaOnLeftChild = leaf.leftFormulas.toMutableList();
    newLeftFormulaOnLeftChild.removeAt(listIndex)
    newLeftFormulaOnLeftChild.add(listIndex,formula.leftChild)
    val newRightFormulaOnLeftChild = leaf.rightFormulas.toMutableList();

    val newLeftFormulaOnRightChild = leaf.leftFormulas.toMutableList();
    newLeftFormulaOnRightChild.removeAt(listIndex)
    newLeftFormulaOnRightChild.add(listIndex,formula.rightChild)
    val newRightFormulaOnRightChild = leaf.rightFormulas.toMutableList();

    val newLeftLeaf = TreeNode(nodeID,newLeftFormulaOnLeftChild.distinct().toMutableList(),newRightFormulaOnLeftChild.distinct().toMutableList(), OrLeft(nodeID, listIndex));
    val newRightLeaf = TreeNode(nodeID,newLeftFormulaOnRightChild.distinct().toMutableList(),newRightFormulaOnRightChild.distinct().toMutableList(), OrLeft(nodeID, listIndex));

    state.tree.add(newLeftLeaf);
    state.tree.add(newRightLeaf);
    state.tree[nodeID].children = arrayOf(state.tree.size - 2, state.tree.size - 1);
    return state;
}

fun applyAndRight(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkRight(state, nodeID, listIndex)

    var leaf = state.tree[nodeID];
    val formula = leaf.rightFormulas.get(listIndex);

    if (formula !is And)
        throw IllegalMove("The rule andRight must be applied on a '∧'");


    val newLeftFormulaOnLeftChild = leaf.leftFormulas.toMutableList();
    val newRightFormulaOnLeftChild = leaf.rightFormulas.toMutableList();
    newRightFormulaOnLeftChild.removeAt(listIndex);
    newRightFormulaOnLeftChild.add(listIndex, formula.leftChild);

    val newLeftFormulaOnRightChild = leaf.leftFormulas.toMutableList();
    val newRightFormulaOnRightChild = leaf.rightFormulas.toMutableList();
    newRightFormulaOnRightChild.removeAt(listIndex);
    newRightFormulaOnRightChild.add(listIndex, formula.rightChild);

    val newLeftLeaf = TreeNode(nodeID, newLeftFormulaOnLeftChild.distinct().toMutableList(), newRightFormulaOnLeftChild.distinct().toMutableList(), AndRight(nodeID, listIndex));
    val newRightLeaf = TreeNode(nodeID, newLeftFormulaOnRightChild.distinct().toMutableList(), newRightFormulaOnRightChild.distinct().toMutableList(), AndRight(nodeID, listIndex));
    state.tree.add(newLeftLeaf);
    state.tree.add(newRightLeaf);
    state.tree[nodeID].children = arrayOf(state.tree.size - 2, state.tree.size - 1);
    return state;
}

fun applyAndLeft(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int): GenericSequentCalculusState {

    checkLeft(state, nodeID, listIndex)

    var leaf = state.tree[nodeID];
    val formula = leaf.leftFormulas.get(listIndex);

    if (formula !is And)
        throw IllegalMove("The rule andLeft must be applied on a '∧'");

    val newLeftFormula = leaf.leftFormulas.toMutableList();
    newLeftFormula.removeAt(listIndex);
    newLeftFormula.add(listIndex, formula.leftChild);
    newLeftFormula.add(listIndex + 1, formula.rightChild);
    val newRightFormula = leaf.rightFormulas.toMutableList();
    val newLeaf = TreeNode(nodeID, newLeftFormula.distinct().toMutableList(), newRightFormula.distinct().toMutableList(), AndLeft(nodeID, listIndex));
    state.tree.add(newLeaf);
    state.tree[nodeID].children = arrayOf(state.tree.size - 1);
    return state;
}


fun checkRight(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int){
    if (nodeID < 0 || state.tree.size <= nodeID)
        throw IllegalMove("nodeID out of Bounds");

    var leaf = state.tree[nodeID];

    if (!leaf.isLeaf)
        throw IllegalMove("Rules can only be applied on Leaf level.")

    if (listIndex < 0 || leaf.rightFormulas.size <= listIndex)
        throw IllegalMove("listIndex out of Bounds.")

    return
}

fun checkLeft(state: GenericSequentCalculusState, nodeID: Int, listIndex: Int){
    if (nodeID < 0 || state.tree.size <= nodeID)
        throw IllegalMove("nodeID out of Bounds");

    var leaf = state.tree[nodeID];

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
    if(state.tree.size <= 1)
        throw IllegalMove("No move to undo");

    val removedNode = state.tree.removeAt(state.tree.size - 1);

    if (!removedNode.isLeaf)
        throw IllegalMove("Rules can only be applied on Leaf level.")

    val parentID: Int? = removedNode.parent;

    val parentNode = state.tree.elementAt(parentID!!);

    if(parentNode.children.size == 1)
        state.tree[parentID].children = emptyArray<Int>();
    else if(parentNode.children.size == 2){
        state.tree.removeAt(state.tree.size - 1);
        state.tree[parentID].children = emptyArray<Int>();
    }
    return state;
}