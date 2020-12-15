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