package kalkulierbar.sequentCalculus.fosc.moveImplementations

import kalkulierbar.IllegalMove
import kalkulierbar.logic.And
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.UnaryOp
import kalkulierbar.logic.UniversalQuantifier
import kalkulierbar.logic.ExistentialQuantifier
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

    //No need to check if swapVariable is already in use for rule allLeft

    var replaceWithString = swapVariable;
    //When swapVariable is not defined try to automatically find a fitting variableName
    if (replaceWithString == null)
        replaceWithString = findFittingVariableName(node);

    //The newFormula which will be added to the left side of the sequence. This is the child of the quantifier
    var newFormula = formula.child.clone();
    
    //Replace all occurances of the quantifiedVariable with swapVariable
    val replaceWith = Constant(replaceWithString);
    val map = mapOf(formula.varName to replaceWith)
    newFormula = LogicNodeVariableInstantiator.transform(newFormula, map);

    //Add newFormula to the left hand side of the sequence
    var newLeftFormulas = node.leftFormulas.toMutableList();
    newLeftFormulas.add(newFormula);
    newLeftFormulas = newLeftFormulas.distinct().toMutableList();
    
    val newLeaf = TreeNode(nodeID, newLeftFormulas, node.rightFormulas.distinct().toMutableList(), AllLeft(nodeID, listIndex, swapVariable));
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

    var replaceWithString = swapVariable;
    //When swapVariable is not defined try to automatically find a fitting variableName
    if (replaceWithString == null)
        replaceWithString = findFittingVariableName(node);

    // Check if swapVariable is not already in use in the current seqeuence
    if (checkIfVariableNameIsAlreadyInUse(node, replaceWithString))
        throw IllegalMove("Can't instatiate with an already existing identifier");

    //The newFormula which will be added to the right side of the sequence. This is the child of the quantifier
    var newFormula = formula.child.clone();
    
    //Replace all occurances of the quantifiedVariable with swapVariable
    val replaceWith = Constant(replaceWithString);
    val map = mapOf(formula.varName to replaceWith)
    newFormula = LogicNodeVariableInstantiator.transform(newFormula, map);

    //Add newFormula to the right hand side of the sequence
    var newRightFormulas = node.rightFormulas.toMutableList();
    newRightFormulas.add(newFormula);
    newRightFormulas.remove(formula);
    newRightFormulas = newRightFormulas.distinct().toMutableList();
    
    val newLeaf = TreeNode(nodeID, node.leftFormulas.distinct().toMutableList(), newRightFormulas, AllRight(nodeID, listIndex, swapVariable));
    state.tree.add(newLeaf);
    node.children = arrayOf(state.tree.size - 1);

    return state;
}

fun applyExLeft(state: FOSCState, nodeID: Int, listIndex: Int, swapVariable: String?): FOSCState {
    checkLeft(state, nodeID, listIndex);

    val node: GenericSequentCalculusNode = state.tree[nodeID];
    val formula: LogicNode = node.leftFormulas[listIndex];
    
    if (formula !is ExistentialQuantifier)
        throw IllegalMove("The rule allRight must be applied on a 'UniversalQuantifier'");

    var replaceWithString = swapVariable;
    //When swapVariable is not defined try to automatically find a fitting variableName
    if (replaceWithString == null)
        replaceWithString = findFittingVariableName(node);

    // Check if swapVariable is not already in use in the current seqeuence
    if (checkIfVariableNameIsAlreadyInUse(node, replaceWithString))
        throw IllegalMove("Can't instatiate with an already existing identifier");

    //The newFormula which will be added to the left side of the sequence. This is the child of the quantifier
    var newFormula = formula.child.clone();
    
    //Replace all occurances of the quantifiedVariable with swapVariable
    val replaceWith = Constant(replaceWithString);
    val map = mapOf(formula.varName to replaceWith)
    newFormula = LogicNodeVariableInstantiator.transform(newFormula, map);

    //Add newFormula to the left hand side of the sequence
    var newLeftFormulas = node.leftFormulas.toMutableList();
    newLeftFormulas.add(newFormula);
    newLeftFormulas.remove(formula);
    newLeftFormulas = newLeftFormulas.distinct().toMutableList();
    
    val newLeaf = TreeNode(nodeID, newLeftFormulas, node.rightFormulas.distinct().toMutableList(), ExLeft(nodeID, listIndex, swapVariable));
    state.tree.add(newLeaf);
    node.children = arrayOf(state.tree.size - 1);

    return state;
}

fun applyExRight(state: FOSCState, nodeID: Int, listIndex: Int, swapVariable: String?): FOSCState {
    checkRight(state, nodeID, listIndex);

    val node: GenericSequentCalculusNode = state.tree[nodeID];
    val formula: LogicNode = node.rightFormulas[listIndex];
    
    if (formula !is ExistentialQuantifier)
        throw IllegalMove("The rule allRight must be applied on a 'UniversalQuantifier'");

    var replaceWithString = swapVariable;
    //When swapVariable is not defined try to automatically find a fitting variableName
    if (replaceWithString == null)
        replaceWithString = findFittingVariableName(node);

    //No need to check if swapVariable is already in use for rule allLeft

    //The newFormula which will be added to the right side of the sequence. This is the child of the quantifier
    var newFormula = formula.child.clone();
    
    //Replace all occurances of the quantifiedVariable with swapVariable
    val replaceWith = Constant(replaceWithString);
    val map = mapOf(formula.varName to replaceWith)
    newFormula = LogicNodeVariableInstantiator.transform(newFormula, map);

    //Add newFormula to the right hand side of the sequence
    var newRightFormulas = node.rightFormulas.toMutableList();
    newRightFormulas.add(newFormula);
    newRightFormulas = newRightFormulas.distinct().toMutableList();
    
    val newLeaf = TreeNode(nodeID, node.leftFormulas.distinct().toMutableList(), newRightFormulas, ExRight(nodeID, listIndex, swapVariable));
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
    var set = mutableSetOf<String>()
    set = node.leftFormulas.fold(set) { a, b -> a.addAll(IdentifierCollector.collect(b)); return@fold a.distinct().toMutableSet() };
    set = node.rightFormulas.fold(set) { a, b -> a.addAll(IdentifierCollector.collect(b)); return@fold a.distinct().toMutableSet() };
    return set.contains(varName);
}

/**
 * Tries to find a variable Name which leads to solving the proof
 */
private fun findFittingVariableName(node: GenericSequentCalculusNode): String {
    throw IllegalMove("Not yet implemented");
}
