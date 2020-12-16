package kalkulierbar.psc

import kalkulierbar.IllegalMove
import kalkulierbar.UnificationImpossible
import kalkulierbar.logic.And
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier
import kalkulierbar.logic.transform.IdentifierCollector
import kalkulierbar.logic.transform.LogicNodeVariableInstantiator
import kalkulierbar.logic.transform.SelectiveSuffixAppender
import kalkulierbar.logic.util.Unification
import kalkulierbar.logic.util.UnifierEquivalence
import kalkulierbar.psc.PSCMove
import kalkulierbar.psc.PSC
import kalkulierbar.logic.UnaryOp

fun applyNotRight(state: PSCState, nodeID: Int, listIndex: Int): PSCState {
    var leaf = state.tree[nodeID];
    if (leaf !is Leaf)
        throw IllegalMove("Rule notRight can only be aplied to a leaf of the sequent calculus.")

    if (listIndex < 0 || leaf.rightFormula.size <= listIndex)
        throw IllegalMove("Rule notRight must be applied on a valid formula of the selected Leaf.")

    val formula = leaf.rightFormula.get(listIndex)

    if (formula !is UnaryOp)
        throw IllegalMove("The rule notRight cannot be applied on BinaryOp")
        
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
    var leaf = state.tree[nodeID];
    if (leaf !is Leaf)
        throw IllegalMove("Rule notRight can only be aplied to a leaf of the sequent calculus.")

    if (listIndex < 0 || leaf.leftFormula.size <= listIndex)
        throw IllegalMove("Rule notRight must be applied on a valid formula of the selected Leaf.")

    val formula = leaf.rightFormula.get(listIndex)

    if (formula !is UnaryOp)
        throw IllegalMove("The rule notRight cannot be applied on BinaryOp")
        
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
    if (nodeID < 0 || state.tree.size <= nodeID)
        throw IllegalMove("nodeID out of bounds");
    var leaf = state.tree[nodeID]
    if (leaf !is Leaf)
        throw IllegalMove("Rule orRight can only be aplied to a leaf of the sequent calculus.")

    if (listIndex < 0 || leaf.rightFormula.size <= listIndex)
        throw IllegalMove("listIndex out of bounds.")

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
    if (nodeID < 0 || state.tree.size <= nodeID)
        throw IllegalMove("nodeID out of bounds");
    var leaf = state.tree[nodeID]
    if (leaf !is Leaf)
        throw IllegalMove("Rule orLeft can only be aplied to a leaf of the sequent calculus.")

    if (listIndex < 0 || leaf.leftFormula.size <= listIndex)
        throw IllegalMove("listIndex out of bounds.")

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