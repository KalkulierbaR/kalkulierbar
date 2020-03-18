package kalkulierbar.nonclausaltableaux

import kalkulierbar.IllegalMove
import kalkulierbar.logic.And
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Or
import kalkulierbar.logic.UniversalQuantifier
import kalkulierbar.logic.transform.IdentifierCollector
import kalkulierbar.logic.transform.SelectiveSuffixAppender

/**
 * While the outermost LogicNode is an AND:
 * Split into subformulae, chain onto a single branch
 * @param state: Non clausal tableaux state to apply move on
 * @param leafID: leaf node ID to apply move on
 * @return new state after applying move
 */
fun applyAlpha(state: NcTableauxState, leafID: Int): NcTableauxState {
    val nodes = state.nodes
    checkLeafRestrictions(nodes, leafID)

    val leaf = nodes[leafID]

    if (leaf.formula !is And)
        throw IllegalMove("Outermost logic operator is not AND")

    val worklist = mutableListOf<LogicNode>(leaf.formula)
    var parentID = leafID

    while (worklist.isNotEmpty()) {
        val subformula = worklist.removeAt(0)
        if (subformula is And) {
            worklist.add(subformula.rightChild)
            worklist.add(subformula.leftChild)
        } else {
            nodes.add(NcTableauxNode(parentID, subformula))
            nodes[parentID].children.add(nodes.size - 1)
            parentID = nodes.size - 1
        }
    }

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(DeltaMove(leafID))
    return state
}

/**
 * While the outermost LogicNode is an OR:
 * Split into subformulae and add to leaf node
 * @param state: non clausal tableaux state to apply move on
 * @param leafID: ID of leaf-node to apply move on
 * @return new state after applying move
 */
fun applyBeta(state: NcTableauxState, leafID: Int): NcTableauxState {
    val nodes = state.nodes
    checkLeafRestrictions(nodes, leafID)

    val leaf = nodes[leafID]

    if (leaf.formula !is Or)
        throw IllegalMove("Outermost logic operator is not OR")

    val worklist = mutableListOf<LogicNode>(leaf.formula)

    while (worklist.isNotEmpty()) {
        val subformula = worklist.removeAt(0)
        if (subformula is Or) {
            worklist.add(subformula.rightChild)
            worklist.add(subformula.leftChild)
        } else {
            nodes.add(NcTableauxNode(leafID, subformula))
            nodes[leafID].children.add(nodes.size - 1)
        }
    }

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(BetaMove(leafID))
    return state
}

/**
 * If outermost LogicNode is a universal quantifier:
 * Remove quantifier and instantiate with fresh variable
 * @param state: non clausal tableaux state to apply move on
 * @param leafID: ID of leaf-node to apply move on
 * @return new state after applying move
 */
fun applyGamma(state: NcTableauxState, leafID: Int): NcTableauxState {
    val nodes = state.nodes
    checkLeafRestrictions(nodes, leafID)

    // Check leaf formula == UniversalQuantifier
    val leafNode = nodes[leafID]
    val formula = leafNode.formula
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
    val newNode = NcTableauxNode(leafID, newFormula)
    nodes.add(newNode)
    leafNode.children.add(nodes.size - 1)

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(GammaMove(leafID))

    return state
}

/**
 * If outermost LogicNode is an existantial quantifier:
 * Remove quantifier and instantiate with Skolem term
 * -> Iff free variables in current node: term = firstOrderTerm (free variables)
 * -> Iff no free variables: term = constant
 * @param state: non clausal tableaux state to apply move on
 * @param leafID: ID of leaf-node to apply move on
 * @return new state after applying move
 */
fun applyDelta(state: NcTableauxState, leafID: Int): NcTableauxState {
    val nodes = state.nodes
    checkLeafRestrictions(nodes, leafID)

    // Check leaf == UniversalQuantifier
    val leafNode = nodes[leafID]
    val formula = leafNode.formula
    if (formula !is ExistentialQuantifier)
        throw IllegalMove("The outermost logic operator is not an existential quantifier")

    state.skolemCounter++
    // Apply skolemization to the top-level existential quantifier
    // This adds the newly created skolem term identifier to the state.identifiers set
    val newFormula = DeltaSkolemization.transform(formula, state.identifiers, state.skolemCounter)

    // Add new node to tree
    val newNode = NcTableauxNode(leafID, newFormula)
    nodes.add(newNode)
    leafNode.children.add(nodes.size - 1)

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(DeltaMove(leafID))
    return state
}

/**
 * Check leafID valid + node at leafID is leaf
 */
fun checkLeafRestrictions(nodes: List<NcTableauxNode>, leafID: Int) {
    if (leafID < 0 || leafID >= nodes.size)
        throw IllegalMove("There is no node with ID: $leafID")
    if (!nodes[leafID].isLeaf)
        throw IllegalMove("Selected node is not a leaf")
}
