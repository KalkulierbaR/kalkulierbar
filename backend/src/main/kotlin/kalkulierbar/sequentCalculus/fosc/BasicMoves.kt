package kalkulierbar.sequentCalculus.fosc.moveImplementations

import kalkulierbar.IllegalMove
import kalkulierbar.logic.Constant
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.UniversalQuantifier
import kalkulierbar.logic.transform.IdentifierCollector
import kalkulierbar.logic.transform.LogicNodeVariableInstantiator
import kalkulierbar.parsers.Tokenizer
import kalkulierbar.sequentCalculus.*
import kalkulierbar.sequentCalculus.GenericSequentCalculusNode
import kalkulierbar.sequentCalculus.TreeNode
import kalkulierbar.sequentCalculus.fosc.FOSCState
import kalkulierbar.sequentCalculus.moveImplementations.checkLeft
import kalkulierbar.sequentCalculus.moveImplementations.checkRight

/**
 * Rule AllLeft is applied, if the LogicNode is the leftChild of node and is of type All(UniversalQuantifier).
 * It replaces the UniversalQuantifier with the swapvariable
 * @param state: FOSCState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @param varAssign: Map of swapvariable used.
 * @return new state after applying move
 */
fun applyAllLeft(state: FOSCState, nodeID: Int, listIndex: Int, varAssign: Map<String, String>): FOSCState {
    checkLeft(state, nodeID, listIndex)

    val node: GenericSequentCalculusNode = state.tree[nodeID]
    val formula: LogicNode = node.leftFormulas[listIndex]

    if (formula !is UniversalQuantifier)
        throw IllegalMove("The rule allRight must be applied on a 'UniversalQuantifier'")

    // No need to check if swapVariable is already in use for rule allLeft

    var replaceWithString = varAssign.get(formula.varName)

    // When swapVariable is not defined try to automatically find a fitting variableName
    if (replaceWithString == null)
        replaceWithString = findFittingVariableName(node)

    // Check if varAssign is a valid string for a constant
    isAllowedVarAssign(replaceWithString)

    // The newFormula which will be added to the left side of the sequence. This is the child of the quantifier
    var newFormula = formula.child.clone()

    // Replace all occurances of the quantifiedVariable with swapVariable
    val replaceWith = Constant(replaceWithString)
    val map = mapOf(formula.varName to replaceWith)
    newFormula = LogicNodeVariableInstantiator.transform(newFormula, map)

    // Add newFormula to the left hand side of the sequence
    var newLeftFormulas = node.leftFormulas.toMutableList()
    newLeftFormulas.add(newFormula)
    newLeftFormulas = newLeftFormulas.distinct().toMutableList()

    val newLeaf = TreeNode(
        nodeID,
        newLeftFormulas,
        node.rightFormulas.distinct().toMutableList(),
        AllLeft(nodeID, listIndex, varAssign)
    )
    state.tree.add(newLeaf)
    node.children = arrayOf(state.tree.size - 1)

    return state
}

/**
 * Rule AllRight is applied, if the LogicNode is the rightChild of node and is of type All(UniversalQuantifier).
 * It replaces the UniversalQuantifier with the swapvariable.Here, Swap Variable should not be Identifier that already exist.
 * @param state: FOSCState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @param varAssign: Map of swapvariable used.
 * @return new state after applying move
 */
fun applyAllRight(state: FOSCState, nodeID: Int, listIndex: Int, varAssign: Map<String, String>): FOSCState {
    checkRight(state, nodeID, listIndex)

    val node: GenericSequentCalculusNode = state.tree[nodeID]
    val formula: LogicNode = node.rightFormulas[listIndex]

    if (formula !is UniversalQuantifier)
        throw IllegalMove("The rule allRight must be applied on a 'UniversalQuantifier'")

    var replaceWithString = varAssign.get(formula.varName)

    // When swapVariable is not defined try to automatically find a fitting variableName
    if (replaceWithString == null)
        replaceWithString = findFittingVariableName(node)

    // Check if varAssign is a valid string for a constant
    isAllowedVarAssign(replaceWithString)

    // Check if swapVariable is not already in use in the current seqeuence
    if (checkIfVariableNameIsAlreadyInUse(node, replaceWithString))
        throw IllegalMove("Can't instatiate with an already existing identifier")

    // The newFormula which will be added to the right side of the sequence. This is the child of the quantifier
    var newFormula = formula.child.clone()

    // Replace all occurances of the quantifiedVariable with swapVariable
    val replaceWith = Constant(replaceWithString)
    val map = mapOf(formula.varName to replaceWith)
    newFormula = LogicNodeVariableInstantiator.transform(newFormula, map)

    // Add newFormula to the right hand side of the sequence
    var newRightFormulas = node.rightFormulas.toMutableList()
    newRightFormulas.add(newFormula)
    newRightFormulas.remove(formula)
    newRightFormulas = newRightFormulas.distinct().toMutableList()

    val newLeaf = TreeNode(
        nodeID,
        node.leftFormulas.distinct().toMutableList(),
        newRightFormulas,
        AllRight(nodeID, listIndex, varAssign)
    )
    state.tree.add(newLeaf)
    node.children = arrayOf(state.tree.size - 1)

    return state
}

/**
 * Rule ExLeft is applied, if the LogicNode is the leftChild of node and is of type Ex(ExistentialQuantifier).
 * It replaces the ExistentialQuantifier with the swapvariable.Here, Swap Variable should not be Identifier that already exist.
 * @param state: FOSCState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @param varAssign: Map of swapvariable used.
 * @return new state after applying move
 */
fun applyExLeft(state: FOSCState, nodeID: Int, listIndex: Int, varAssign: Map<String, String>): FOSCState {
    checkLeft(state, nodeID, listIndex)

    val node: GenericSequentCalculusNode = state.tree[nodeID]
    val formula: LogicNode = node.leftFormulas[listIndex]

    if (formula !is ExistentialQuantifier)
        throw IllegalMove("The rule exLeft must be applied on a 'ExistentialQuantifier'")

    var replaceWithString = varAssign.get(formula.varName)

    // When swapVariable is not defined try to automatically find a fitting variableName
    if (replaceWithString == null)
        replaceWithString = findFittingVariableName(node)

    // Check if varAssign is a valid string for a constant
    isAllowedVarAssign(replaceWithString)

    // Check if swapVariable is not already in use in the current seqeuence
    if (checkIfVariableNameIsAlreadyInUse(node, replaceWithString))
        throw IllegalMove("Can't instatiate with an already existing identifier")

    // The newFormula which will be added to the left side of the sequence. This is the child of the quantifier
    var newFormula = formula.child.clone()

    // Replace all occurances of the quantifiedVariable with swapVariable
    val replaceWith = Constant(replaceWithString)
    val map = mapOf(formula.varName to replaceWith)
    newFormula = LogicNodeVariableInstantiator.transform(newFormula, map)

    // Add newFormula to the left hand side of the sequence
    var newLeftFormulas = node.leftFormulas.toMutableList()
    newLeftFormulas.add(newFormula)
    newLeftFormulas.remove(formula)
    newLeftFormulas = newLeftFormulas.distinct().toMutableList()

    val newLeaf = TreeNode(
        nodeID,
        newLeftFormulas,
        node.rightFormulas.distinct().toMutableList(),
        ExLeft(nodeID, listIndex, varAssign)
    )
    state.tree.add(newLeaf)
    node.children = arrayOf(state.tree.size - 1)

    return state
}

/**
 * Rule ExRight is applied, if the LogicNode is the rightChild of node and is of type Ex(ExistentialQuantifier).
 * It replaces the ExistentialQuantifier with the swapvariable
 * @param state: FOSCState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @param varAssign: Map of swapvariable used.
 * @return new state after applying move
 */
fun applyExRight(state: FOSCState, nodeID: Int, listIndex: Int, varAssign: Map<String, String>): FOSCState {
    checkRight(state, nodeID, listIndex)

    val node: GenericSequentCalculusNode = state.tree[nodeID]
    val formula: LogicNode = node.rightFormulas[listIndex]

    if (formula !is ExistentialQuantifier)
        throw IllegalMove("The rule exRight must be applied on a 'ExistentialQuantifier'")

    var replaceWithString = varAssign.get(formula.varName)

    // When swapVariable is not defined try to automatically find a fitting variableName
    if (replaceWithString == null)
        replaceWithString = findFittingVariableName(node)

    // Check if varAssign is a valid string for a constant
    isAllowedVarAssign(replaceWithString)

    // No need to check if swapVariable is already in use for rule allLeft

    // The newFormula which will be added to the right side of the sequence. This is the child of the quantifier
    var newFormula = formula.child.clone()

    // Replace all occurances of the quantifiedVariable with swapVariable
    val replaceWith = Constant(replaceWithString)
    val map = mapOf(formula.varName to replaceWith)
    newFormula = LogicNodeVariableInstantiator.transform(newFormula, map)

    // Add newFormula to the right hand side of the sequence
    var newRightFormulas = node.rightFormulas.toMutableList()
    newRightFormulas.add(newFormula)
    newRightFormulas = newRightFormulas.distinct().toMutableList()

    val newLeaf = TreeNode(
        nodeID,
        node.leftFormulas.distinct().toMutableList(),
        newRightFormulas,
        ExRight(nodeID, listIndex, varAssign)
    )
    state.tree.add(newLeaf)
    node.children = arrayOf(state.tree.size - 1)

    return state
}

/**
 * Checks if a given variableName is used in a sequence.
 * Note: This method will check all identifiers: Relations, Functions, Constants and QuantifiedVariables
 * @param node The sequence in which to look for the variableName
 * @param varName The variable name to be compared with
 */
private fun checkIfVariableNameIsAlreadyInUse(node: GenericSequentCalculusNode, varName: String): Boolean {
    var set = mutableSetOf<String>()
    set = node.leftFormulas.fold(set) { a, b -> a.addAll(IdentifierCollector.collect(b)); return@fold a.distinct().toMutableSet() }
    set = node.rightFormulas.fold(set) { a, b -> a.addAll(IdentifierCollector.collect(b)); return@fold a.distinct().toMutableSet() }
    return set.contains(varName)
}

/**
 * Tries to find a variable Name which leads to solving the proof
 */
private fun findFittingVariableName(node: GenericSequentCalculusNode): String {
    throw IllegalMove("Not yet implemented")
}

/**
 * Checks if a string is syntactically allowed to be assigned as a constant for quantifier instantiation
 */
@Suppress("ThrowsCount")
private fun isAllowedVarAssign(str: String): Boolean {
    if (str.length <= 0) {
        throw IllegalMove("Can't Instantiate with empty identifier.")
    }

    if (str.get(0).isUpperCase()) {
        throw IllegalMove("Constants need to start with a lowercase Letter.")
    }

    for (i in str.indices) {
        if (!Tokenizer.isAllowedChar(str.get(i)))
            throw IllegalMove("Character at position " + i.toString() + " is not allowed within Constant")
    }
    return true
}
