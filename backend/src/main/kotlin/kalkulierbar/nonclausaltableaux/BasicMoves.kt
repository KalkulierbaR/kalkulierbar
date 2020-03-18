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

    val workList = mutableListOf(node.formula)

    while (workList.isNotEmpty()) {
        val subFormula = workList.removeAt(0)
        if (subFormula is Or) {
            workList.add(subFormula.rightChild)
            workList.add(subFormula.leftChild)
        } else {
            nodes.add(NcTableauxNode(nodeID, subFormula))
            nodes[nodeID].children.add(nodes.size - 1)
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
    nodes.add(newNode)
    node.children.add(nodes.size - 1)

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

    state.skolemCounter++
    // Apply skolemization to the top-level existential quantifier
    // This adds the newly created skolem term identifier to the state.identifiers set
    val newFormula = DeltaSkolemization.transform(formula, state.identifiers, state.skolemCounter)

    // Add new node to tree
    val newNode = NcTableauxNode(nodeID, newFormula)
    nodes.add(newNode)
    node.children.add(nodes.size - 1)

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(DeltaMove(nodeID))
    return state
}

/**
 * Check nodeID valid
 */
fun checkRestrictions(nodes: List<NcTableauxNode>, nodeID: Int) {
    if (nodeID < 0 || nodeID >= nodes.size)
        throw IllegalMove("There is no node with ID: $nodeID")
}
