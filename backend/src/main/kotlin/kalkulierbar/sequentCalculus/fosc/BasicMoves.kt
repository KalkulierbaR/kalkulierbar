package kalkulierbar.sequentCalculus.fosc.moveImplementations

import kalkulierbar.IllegalMove
import kalkulierbar.logic.And
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.UnaryOp
import kalkulierbar.logic.UniversalQuantifier
import kalkulierbar.logic.util.VariableCanonicizer
import java.io.Console

import kalkulierbar.sequentCalculus.*
import kalkulierbar.sequentCalculus.GenericSequentCalculusNode
import kalkulierbar.sequentCalculus.TreeNode
import kalkulierbar.sequentCalculus.moveImplementations.checkRight
import kalkulierbar.sequentCalculus.moveImplementations.checkLeft
import kalkulierbar.sequentCalculus.fosc.FOSCState
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.Constant
import kalkulierbar.logic.QuantifiedVariable

import kalkulierbar.logic.transform.LogicNodeVariableInstantiator
import kalkulierbar.logic.transform.IdentifierCollector

fun applyAllLeft(state: FOSCState, nodeID: Int, listIndex: Int, swapVariable: String?): FOSCState {
    checkLeft(state, nodeID, listIndex);

    val node: GenericSequentCalculusNode = state.tree[nodeID];
    val formula: LogicNode = node.leftFormulas[listIndex];
    
    if (formula !is UniversalQuantifier)
        throw IllegalMove("The rule allRight must be applied on a 'UniversalQuantifier'");

    if (swapVariable == null)
        throw IllegalMove("Not yet implemented")

    var newFormula = formula.child.clone();
    
    val replaceWith = Constant(swapVariable);
    val map = mapOf(formula.varName to replaceWith)
    
    newFormula = LogicNodeVariableInstantiator.transform(newFormula, map);

    var newLeftFormulas = node.leftFormulas.toMutableList();
    newLeftFormulas.add(newFormula);
    newLeftFormulas = newLeftFormulas.distinct().toMutableList();
    
    val newLeaf = TreeNode(nodeID, newLeftFormulas, node.rightFormulas.distinct().toMutableList(), AllRight(nodeID, listIndex, swapVariable));
    state.tree.add(newLeaf);
    node.children = arrayOf(state.tree.size - 1);

    return state;
}

fun applyAllRight(state: FOSCState, nodeID: Int, listIndex: Int, swapVariable: String?): FOSCState {
    checkRight(state, nodeID, listIndex);

    val node: GenericSequentCalculusNode = state.tree[nodeID];
    val formula: LogicNode = node.rightFormulas[listIndex];
    
    if (formula !is UniversalQuantifier)
        throw IllegalMove("The rule allRight must be applied on a 'UniversalQuantifier'");

    if (swapVariable == null)
        throw IllegalMove("Not yet implemented")

    // Check if swapVariable is not already in use in the current seqeuence
    if (checkIfVariableNameIsAlreadyInUse(node, swapVariable))
        throw IllegalMove("Can't instatiate with an already existing identifier");

    var newFormula = formula.child.clone();
    
    val replaceWith = Constant(swapVariable);
    val map = mapOf(formula.varName to replaceWith)
    
    newFormula = LogicNodeVariableInstantiator.transform(newFormula, map);

    var newRightFormulas = node.rightFormulas.toMutableList();
    newRightFormulas.add(newFormula);
    newRightFormulas = newRightFormulas.distinct().toMutableList();
    
    val newLeaf = TreeNode(nodeID, node.leftFormulas.distinct().toMutableList(), newRightFormulas, AllRight(nodeID, listIndex, swapVariable));
    state.tree.add(newLeaf);
    node.children = arrayOf(state.tree.size - 1);

    return state;
}

/**
 * Checks if a given variableName is used in a sequence.
 * Note: This method will check all identifiers: Relations, Functions, Constants and QuantifiedVariables
 * @param node The sequence in which to look for the variableName
 * @param varName The variable name to be compared with
 */
private fun checkIfVariableNameIsAlreadyInUse(node: GenericSequentCalculusNode, varName: String): Boolean {
    val set = mutableSetOf<String>()
    node.leftFormulas.fold(set) { a, b -> a.addAll(IdentifierCollector.collect(b)); return@fold a.distinct().toMutableSet() };
    node.rightFormulas.fold(set) { a, b -> a.addAll(IdentifierCollector.collect(b)); return@fold a.distinct().toMutableSet() };
    return set.contains(varName);
}
