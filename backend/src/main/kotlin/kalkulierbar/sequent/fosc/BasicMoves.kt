package kalkulierbar.sequent.fosc

import kalkulierbar.IllegalMove
import kalkulierbar.logic.*
import kalkulierbar.logic.transform.LogicNodeVariableInstantiator
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.sequent.*
import kalkulierbar.logic.transform.Signature

/**
 * Rule AllLeft is applied, if the LogicNode is the leftChild of node and is of type All(UniversalQuantifier).
 * It replaces the UniversalQuantifier with the swapvariable
 * @param state: FOSCState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @param instTerm: The term to instantiate with.
 * @return new state after applying move
 */
fun applyAllLeft(state: FOSCState, nodeID: Int, listIndex: Int, instTerm: String): FOSCState {
    checkLeft(state, nodeID, listIndex)

    val node = state.tree[nodeID]
    val formula: LogicNode = node.leftFormulas[listIndex]

    if (formula !is UniversalQuantifier)
        throw IllegalMove("Rule allLeft can only be applied on a universal quantifier")

    val replaceWith = FirstOrderParser.parseTerm(instTerm)
    checkAdherenceToSignature(replaceWith, node)

    // The newFormula which will be added to the left side of the sequence. This is the child of the quantifier
    var newFormula = formula.child.clone()

    // Replace all occurrences of the quantifiedVariable with swapVariable
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
        AllLeft(nodeID, listIndex, instTerm)
    )

    state.addChildren(nodeID, newLeaf)

    return state
}

/**
 * Rule AllRight is applied, if the LogicNode is the rightChild of node and is of type All(UniversalQuantifier).
 * It replaces the UniversalQuantifier with the swapvariable.Here, Swap Variable should not be Identifier that already exist.
 * @param state: FOSCState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @param instTerm The term to instantiate with. Must be a constant.
 * @return new state after applying move
 */
fun applyAllRight(state: FOSCState, nodeID: Int, listIndex: Int, instTerm: String?): FOSCState {
    checkRight(state, nodeID, listIndex)

    val node = state.tree[nodeID]
    val formula: LogicNode = node.rightFormulas[listIndex]

    if (formula !is UniversalQuantifier)
        throw IllegalMove("Rule allRight can only be applied on a universal quantifier")

    // When swapVariable is not defined try to automatically find a fitting variableName
    val replaceWithString = instTerm ?: findFittingVariableName(node, formula.varName)

    // Check if varAssign is a valid string for a constant
    val replaceWith = FirstOrderParser.parseConstant(replaceWithString)

    // Check if swapVariable is not already in use in the current sequence
    if (checkIfVariableNameIsAlreadyInUse(node, replaceWithString))
        throw IllegalMove("Identifier '$replaceWithString' is already in use")

    // The newFormula which will be added to the right side of the sequence. This is the child of the quantifier
    var newFormula = formula.child.clone()

    // Replace all occurrences of the quantifiedVariable with swapVariable
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
        AllRight(nodeID, listIndex, instTerm)
    )

    state.addChildren(nodeID, newLeaf)

    return state
}

/**
 * Rule ExLeft is applied, if the LogicNode is the leftChild of node and is of type Ex(ExistentialQuantifier).
 * It replaces the ExistentialQuantifier with the swapvariable.Here, Swap Variable should not be Identifier that already exist.
 * @param state: FOSCState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @param varAssign: instTerm The term to instantiate with. Must be a constant.
 * @return new state after applying move
 */
fun applyExLeft(state: FOSCState, nodeID: Int, listIndex: Int, instTerm: String?): FOSCState {
    checkLeft(state, nodeID, listIndex)

    val node = state.tree[nodeID]
    val formula: LogicNode = node.leftFormulas[listIndex]

    if (formula !is ExistentialQuantifier)
        throw IllegalMove("Rule exLeft can only be applied on an existential quantifier")

    // When swapVariable is not defined try to automatically find a fitting variableName
    val replaceWithString = instTerm ?: findFittingVariableName(node, formula.varName)

    // Check if varAssign is a valid string for a constant
    val replaceWith = FirstOrderParser.parseConstant(replaceWithString)

    // Check if swapVariable is not already in use in the current sequence
    if (checkIfVariableNameIsAlreadyInUse(node, replaceWithString))
        throw IllegalMove("Identifier '$replaceWithString' is already in use")

    // The newFormula which will be added to the left side of the sequence. This is the child of the quantifier
    var newFormula = formula.child.clone()

    // Replace all occurrences of the quantifiedVariable with swapVariable
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
        ExLeft(nodeID, listIndex, instTerm)
    )
    state.addChildren(nodeID, newLeaf)

    return state
}

/**
 * Rule ExRight is applied, if the LogicNode is the rightChild of node and is of type Ex(ExistentialQuantifier).
 * It replaces the ExistentialQuantifier with the swapvariable
 * @param state: FOSCState state to apply move on
 * @param nodeID: ID of node to apply move on
 * @param listIndex: Index of the formula(logicNode) to which move should be applied.
 * @param instTerm: The term to instantiate with.
 * @return new state after applying move
 */
fun applyExRight(state: FOSCState, nodeID: Int, listIndex: Int, instTerm: String): FOSCState {
    checkRight(state, nodeID, listIndex)

    val node = state.tree[nodeID]
    val formula: LogicNode = node.rightFormulas[listIndex]

    if (formula !is ExistentialQuantifier)
        throw IllegalMove("Rule exRight can only be applied on an existential quantifier")

    val replaceWith = FirstOrderParser.parseTerm(instTerm)
    checkAdherenceToSignature(replaceWith, node)

    // The newFormula which will be added to the right side of the sequence. This is the child of the quantifier
    var newFormula = formula.child.clone()

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
        ExRight(nodeID, listIndex, instTerm)
    )
    state.addChildren(nodeID, newLeaf)

    return state
}

fun checkAdherenceToSignature(term: FirstOrderTerm, node: TreeNode) {
    if (term is Constant) return
    val sig = Signature.of(node.leftFormulas + node.rightFormulas)
    sig.check(term)
}

/**
 * Checks if a given variableName is used in a sequence.
 * Note: This method will check all identifiers: Relations, Functions, Constants and QuantifiedVariables
 * @param node The sequence in which to look for the variableName
 * @param varName The variable name to be compared with
 */
private fun checkIfVariableNameIsAlreadyInUse(node: TreeNode, varName: String): Boolean {
    val sig = Signature.of(node.leftFormulas + node.rightFormulas)
    return sig.hasConstOrFunction(varName)
}

/**
 * Tries to find a variable Name which leads to solving the proof
 */
private fun findFittingVariableName(node: TreeNode, quantVar: String): String {
    val sig = Signature.of(node.leftFormulas + node.rightFormulas)

    val baseName = quantVar.lowercase()
    var idx = 0

    while (sig.hasConstOrFunction("${baseName}_$idx")) {
        idx++
    }

    return "${baseName}_$idx"
}
