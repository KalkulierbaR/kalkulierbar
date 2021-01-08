package kalkulierbar.psc

import kalkulierbar.IllegalMove
import kalkulierbar.logic.And
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.psc.PSCMove
import kalkulierbar.psc.PSC
import kalkulierbar.logic.UnaryOp
import java.io.Console

fun applyAx(state: PSCState, nodeID: Int) : PSCState {

    if (nodeID < 0 || state.tree.size <= nodeID)
        throw IllegalMove("nodeID out of bounds.")
    
    var leaf = state.tree[nodeID];
    
    if (leaf !is Leaf)
        throw IllegalMove("Rules must be applied on leaf level.")

    for (leftFormula in leaf.leftFormula) {
        if (leaf.rightFormula.find { elem -> elem.synEq(leftFormula) } != null) {
            val newLeaf = Leaf(nodeID, mutableListOf<LogicNode>(), mutableListOf<LogicNode>());
            state.tree.add(newLeaf);
            state.tree[nodeID] = OneChildNode(leaf.parent, state.tree.size - 1, leaf.leftFormula, leaf.rightFormula)
            return state;
        }
    }    
    throw IllegalMove("Rule 'Ax' needs two nodes of the same kind on both sides to be applied.")
}

fun applyNotRight(state: PSCState, nodeID: Int, listIndex: Int): PSCState {

    checkRight(state, nodeID, listIndex)

    var leaf = state.tree[nodeID];
    val formula = leaf.rightFormula.get(listIndex)

    if (formula !is Not)
        throw IllegalMove("The rule notRight must be applied on '!'")
        
    val newLeftFormula = leaf.leftFormula.toMutableList();
    newLeftFormula.add(formula.child);
    val newRightFormula = leaf.rightFormula.toMutableList();
    newRightFormula.removeAt(listIndex);

    var newLeaf = Leaf(nodeID, newLeftFormula.distinct().toMutableList(), newRightFormula.distinct().toMutableList())
    state.tree.add(newLeaf);
    state.tree[nodeID] = OneChildNode(leaf.parent, state.tree.size - 1, leaf.leftFormula, leaf.rightFormula);
    return state;
}

fun applyNotLeft(state: PSCState, nodeID: Int, listIndex: Int): PSCState {

    checkLeft(state, nodeID, listIndex)

    var leaf = state.tree[nodeID];
    val formula = leaf.rightFormula.get(listIndex)

    if (formula !is Not)
        throw IllegalMove("The rule notLeft must be applied on '!'")
        
    val newLeftFormula = leaf.leftFormula.toMutableList();
    newLeftFormula.removeAt(listIndex);
    val newRightFormula = leaf.rightFormula.toMutableList();
    newRightFormula.add(formula.child);

    var newLeaf = Leaf(nodeID, newLeftFormula.distinct().toMutableList(), newRightFormula.distinct().toMutableList())
    state.tree.add(newLeaf);
    state.tree[nodeID] = OneChildNode(leaf.parent, state.tree.size - 1, leaf.leftFormula, leaf.rightFormula)
    return state;
}

fun applyOrRight(state: PSCState, nodeID: Int, listIndex: Int): PSCState {

    checkRight(state, nodeID, listIndex)

    var leaf = state.tree[nodeID]
    val formula = leaf.rightFormula.get(listIndex);

    if (formula !is Or)
        throw IllegalMove("The rule orRight must be applied on '|' ")

    val newLeftFormula = leaf.leftFormula.toMutableList();
    val newRightFormula = leaf.rightFormula.toMutableList();
    newRightFormula.removeAt(listIndex)
    newRightFormula.add(listIndex,formula.leftChild)
    newRightFormula.add(listIndex + 1, formula.rightChild)
    val newLeaf = Leaf(nodeID, newLeftFormula.distinct().toMutableList(), newRightFormula.distinct().toMutableList());
    state.tree.add(newLeaf)
    state.tree[nodeID] = OneChildNode(leaf.parent, state.tree.size -1 , leaf.leftFormula, leaf.rightFormula);
    return state;
}

fun applyOrLeft(state: PSCState, nodeID: Int, listIndex: Int): PSCState {

    checkLeft(state, nodeID, listIndex)

    var leaf = state.tree[nodeID]
    val formula = leaf.leftFormula.get(listIndex);

    if (formula !is Or)
        throw IllegalMove("The rule orLeft must be applied on a '|' ")

    val newLeftFormulaOnLeftChild = leaf.leftFormula.toMutableList();
    newLeftFormulaOnLeftChild.removeAt(listIndex)
    newLeftFormulaOnLeftChild.add(listIndex,formula.leftChild)
    val newRightFormulaOnLeftChild = leaf.rightFormula.toMutableList();

    val newLeftFormulaOnRightChild = leaf.leftFormula.toMutableList();
    newLeftFormulaOnRightChild.removeAt(listIndex)
    newLeftFormulaOnRightChild.add(listIndex,formula.rightChild)
    val newRightFormulaOnRightChild = leaf.rightFormula.toMutableList();

    val newLeftLeaf = Leaf(nodeID,newLeftFormulaOnLeftChild.distinct().toMutableList(),newRightFormulaOnLeftChild.distinct().toMutableList());
    val newRightLeaf = Leaf(nodeID,newLeftFormulaOnRightChild.distinct().toMutableList(),newRightFormulaOnRightChild.distinct().toMutableList());

    state.tree.add(newLeftLeaf);
    state.tree.add(newRightLeaf);
    state.tree[nodeID] = TwoChildNode(leaf.parent , state.tree.size -2, state.tree.size-1 , leaf.leftFormula, leaf.rightFormula);
    return state;
}

fun applyAndRight(state: PSCState, nodeID: Int, listIndex: Int): PSCState {

    checkRight(state, nodeID, listIndex)

    var leaf = state.tree[nodeID];
    val formula = leaf.rightFormula.get(listIndex);

    if (formula !is And)
        throw IllegalMove("The rule andRight must be applied on a '&'");


    val newLeftFormulaOnLeftChild = leaf.leftFormula.toMutableList();
    val newRightFormulaOnLeftChild = leaf.rightFormula.toMutableList();
    newRightFormulaOnLeftChild.removeAt(listIndex);
    newRightFormulaOnLeftChild.add(listIndex, formula.leftChild);

    val newLeftFormulaOnRightChild = leaf.leftFormula.toMutableList();
    val newRightFormulaOnRightChild = leaf.rightFormula.toMutableList();
    newRightFormulaOnRightChild.removeAt(listIndex);
    newRightFormulaOnRightChild.add(listIndex, formula.rightChild);

    val newLeftLeaf = Leaf(nodeID, newLeftFormulaOnLeftChild.distinct().toMutableList(), newRightFormulaOnLeftChild.distinct().toMutableList());
    val newRightLeaf = Leaf(nodeID, newLeftFormulaOnRightChild.distinct().toMutableList(), newRightFormulaOnRightChild.distinct().toMutableList());
    state.tree.add(newLeftLeaf);
    state.tree.add(newRightLeaf);
    state.tree[nodeID] = TwoChildNode(leaf.parent, state.tree.size - 2, state.tree.size - 1, leaf.leftFormula, leaf.rightFormula);
    return state;
}

fun applyAndLeft(state: PSCState, nodeID: Int, listIndex: Int): PSCState {

    checkLeft(state, nodeID, listIndex)

    var leaf = state.tree[nodeID];
    val formula = leaf.leftFormula.get(listIndex);

    if (formula !is And)
        throw IllegalMove("The rule andLeft must be applied on a '&'");

    val newLeftFormula = leaf.leftFormula.toMutableList();
    newLeftFormula.removeAt(listIndex);
    newLeftFormula.add(listIndex, formula.leftChild);
    newLeftFormula.add(listIndex + 1, formula.rightChild);
    val newRightFormula = leaf.rightFormula.toMutableList();
    val newLeaf = Leaf(nodeID, newLeftFormula.distinct().toMutableList(), newRightFormula.distinct().toMutableList());
    state.tree.add(newLeaf);
    state.tree[nodeID] = OneChildNode(leaf.parent, state.tree.size - 1, leaf.leftFormula, leaf.rightFormula);
    return state;
}


fun checkRight(state: PSCState, nodeID: Int, listIndex: Int){
    if (nodeID < 0 || state.tree.size <= nodeID)
        throw IllegalMove("nodeID out of Bounds");

    var leaf = state.tree[nodeID];

    if (leaf !is Leaf)
        throw IllegalMove("Rules can only be applied on Leaf level.")

    if (listIndex < 0 || leaf.rightFormula.size <= listIndex)
        throw IllegalMove("listIndex out of Bounds.")

    return
}

fun checkLeft(state: PSCState, nodeID: Int, listIndex: Int){
    if (nodeID < 0 || state.tree.size <= nodeID)
        throw IllegalMove("nodeID out of Bounds");

    var leaf = state.tree[nodeID];

    if (leaf !is Leaf)
        throw IllegalMove("Rules can only be applied on Leaf level.")

    if (listIndex < 0 || leaf.leftFormula.size <= listIndex)
        throw IllegalMove("listIndex out of Bounds.")

    return
}