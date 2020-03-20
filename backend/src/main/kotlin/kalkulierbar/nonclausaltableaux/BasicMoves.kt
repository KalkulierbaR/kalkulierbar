package kalkulierbar.nonclausaltableaux

import kalkulierbar.IllegalMove
import kalkulierbar.logic.And
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.Or
import kalkulierbar.logic.UniversalQuantifier
import kalkulierbar.logic.transform.IdentifierCollector
import kalkulierbar.logic.transform.SelectiveSuffixAppender

/**
 * While the outermost LogicNode is an AND:
 * Split into subformulae, chain onto a single branch
 * @param state: Non clausal tableaux state to apply move on
 * @param nodeID: node ID to apply move on
 * @return new state after applying move
 */
fun applyAlpha(state: NcTableauxState, nodeID: Int): NcTableauxState {
    val nodes = state.nodes
    checkRestrictions(nodes, nodeID)

    val node = nodes[nodeID]
    val savedChildren = node.children.toMutableList() // Save a copy of the node's children
    node.children.clear() // We will insert new nodes between the node and its children

    if (node.formula !is And)
        throw IllegalMove("Outermost logic operator is not AND")

    val workList = mutableListOf(node.formula)
    var parentID = nodeID

    while (workList.isNotEmpty()) {
        val subFormula = workList.removeAt(0)
        if (subFormula is And) {
            workList.add(subFormula.rightChild)
            workList.add(subFormula.leftChild)
        } else {
            nodes.add(NcTableauxNode(parentID, subFormula))
            nodes[parentID].children.add(nodes.size - 1)
            parentID = nodes.size - 1
        }
    }

    // Add the node's children to the last inserted node to restore the tree structure
    nodes[parentID].children.addAll(savedChildren)
    state.setParent(savedChildren, nodes.size - 1)
    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(AlphaMove(nodeID))
    return state
}

/**
 * While the outermost LogicNode is an OR:
 * Split into subformulae and add to node
 * @param state: non clausal tableaux state to apply move on
 * @param nodeID: ID of node to apply move on
 * @return new state after applying move
 */
fun applyBeta(state: NcTableauxState, nodeID: Int): NcTableauxState {
    val nodes = state.nodes
    checkRestrictions(nodes, nodeID)

    val node = nodes[nodeID]

    if (node.formula !is Or)
        throw IllegalMove("Outermost logic operator is not OR")

    // Collect all leaves in the current branch where the split nodes
    // will have to be appended
    // If the node is a leaf, this will only be the nodeID
    val branchLeaveIDs = state.childLeavesOf(nodeID)

    val workList = mutableListOf(node.formula)

    while (workList.isNotEmpty()) {
        val subFormula = workList.removeAt(0)
        // Further decompose the formula
        if (subFormula is Or) {
            workList.add(subFormula.rightChild)
            workList.add(subFormula.leftChild)
        } else {
            // Append the split nodes to every leaf
            branchLeaveIDs.forEach {
                nodes.add(NcTableauxNode(it, subFormula.clone()))
                nodes[it].children.add(nodes.size - 1)
            }
        }
    }

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(BetaMove(nodeID))
    return state
}

/**
 * If outermost LogicNode is a universal quantifier:
 * Remove quantifier and instantiate with fresh variable
 * @param state: non clausal tableaux state to apply move on
 * @param nodeID: ID of node to apply move on
 * @return new state after applying move
 */
fun applyGamma(state: NcTableauxState, nodeID: Int): NcTableauxState {
    val nodes = state.nodes
    checkRestrictions(nodes, nodeID)

    // Check node formula == UniversalQuantifier
    val node = nodes[nodeID]
    val formula = node.formula
    if (formula !is UniversalQuantifier)
        throw IllegalMove("Outermost logic operator is not a universal quantifier")

    // Prepare the selected node for insertion of new nodes
    val savedChildren = node.children.toMutableList()
    node.children.clear()

    // Transform new Formula + remove UniversalQuantifier
    val vars = formula.boundVariables
    state.gammaSuffixCounter += 1
    val suffix = "_${state.gammaSuffixCounter}"
    val newFormula = SelectiveSuffixAppender.transform(formula.child, vars, suffix)

    // Add new identifiers to the set
    // This is not strictly speaking necessary as skolem term names can never be in
    // conflict with suffixed variable names, but we'll do it still to ensure
    // that state.identifiers contains _all_ identifiers in the tableaux
    state.identifiers.addAll(IdentifierCollector.collect(newFormula))

    // Add new node to tree
    val newNode = NcTableauxNode(nodeID, newFormula)
    newNode.children.addAll(savedChildren)

    nodes.add(newNode)
    node.children.add(nodes.size - 1)
    state.setParent(savedChildren, nodes.size - 1)
    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(GammaMove(nodeID))

    return state
}

/**
 * If outermost LogicNode is an existantial quantifier:
 * Remove quantifier and instantiate with Skolem term
 * -> Iff free variables in current node: term = firstOrderTerm (free variables)
 * -> Iff no free variables: term = constant
 * @param state: non clausal tableaux state to apply move on
 * @param nodeID: ID of node to apply move on
 * @return new state after applying move
 */
fun applyDelta(state: NcTableauxState, nodeID: Int): NcTableauxState {
    val nodes = state.nodes
    checkRestrictions(nodes, nodeID)

    // Check node == UniversalQuantifier
    val node = nodes[nodeID]
    val formula = node.formula
    if (formula !is ExistentialQuantifier)
        throw IllegalMove("The outermost logic operator is not an existential quantifier")

    // Prepare the selected node for insertion of new nodes
    val savedChildren = node.children.toMutableList()
    node.children.clear()

    // Apply skolemization to the top-level existential quantifier
    // This adds the newly created skolem term identifier to the state.identifiers set
    state.skolemCounter++
    val newFormula = DeltaSkolemization.transform(formula, state.identifiers, state.skolemCounter)

    // Add new node to tree
    val newNode = NcTableauxNode(nodeID, newFormula)
    newNode.children.addAll(savedChildren)
    nodes.add(newNode)
    node.children.add(nodes.size - 1)
    state.setParent(savedChildren, nodes.size - 1)

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(DeltaMove(nodeID))
    return state
}

/**
 * Check nodeID valid + already closed
 */
fun checkRestrictions(nodes: List<NcTableauxNode>, nodeID: Int) {
    if (nodeID < 0 || nodeID >= nodes.size)
        throw IllegalMove("There is no node with ID: $nodeID")
    // Verify that node is not already closed
    val node = nodes[nodeID]
    if (node.isClosed)
        throw IllegalMove("Node '$node' is already closed")
}
