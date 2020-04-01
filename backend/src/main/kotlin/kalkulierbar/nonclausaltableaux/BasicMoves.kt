package kalkulierbar.nonclausaltableaux

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

/**
 * While the outermost LogicNode is an AND:
 * Split into subformulae, chain onto a single branch
 * @param state: Non clausal tableaux state to apply move on
 * @param nodeID: node ID to apply move on
 * @return new state after applying move
 */
fun applyAlpha(state: NcTableauxState, nodeID: Int): NcTableauxState {
    val nodes = state.nodes
    checkNodeRestrictions(nodes, nodeID)

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
    checkNodeRestrictions(nodes, nodeID)

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
            // Append the split nodes to every leaf that is not closed
            branchLeaveIDs.filter { !nodes[it].isClosed }.forEach {
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
    checkNodeRestrictions(nodes, nodeID)

    val node = nodes[nodeID]
    // Note: This clone() is important as it restores quantifier linking
    //       Which cannot be recovered from deserialization
    val formula = node.formula.clone()

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
    checkNodeRestrictions(nodes, nodeID)

    val node = nodes[nodeID]
    // Note: This clone() is important as it restores quantifier linking
    //       Which cannot be recovered from deserialization
    val formula = node.formula.clone()

    // Check node == UniversalQuantifier
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
 * Applies close move by following constraints:
 * 1. The outermost LogicNode is a NOT for one and RELATION for the other
 * 2. The child of the NOT node is a RELATION (think this is already covered by converting to NNF)
 * 3. Both RELATION nodes are syntactically equal after (global) variable instantiation
 * @param state State to apply close move on
 * @param nodeID Node to close
 * @param closeID Node to close with
 * @param varAssign variable assignment to instantiate variables
 * @return state after applying move
 */
@Suppress("ThrowsCount", "ComplexMethod", "LongMethod")
fun applyClose(
    state: NcTableauxState,
    nodeID: Int,
    closeID: Int,
    varAssign: Map<String, FirstOrderTerm>?
): NcTableauxState {
    checkCloseIDRestrictions(state, nodeID, closeID)

    val node = state.nodes[nodeID]
    val closeNode = state.nodes[closeID]
    val nodeFormula = node.formula
    val closeNodeFormula = closeNode.formula

    // Verify that node and closeNode are (negated) Relations of compatible polarity
    val (nodeRelation, closeRelation) = checkCloseRelation(nodeFormula, closeNodeFormula)

    // Use user-supplied variable assignment if given, calculate MGU otherwise
    val unifier: Map<String, FirstOrderTerm>
    unifier = varAssign
            ?: try {
                Unification.unify(nodeRelation, closeRelation)
            } catch (e: UnificationImpossible) {
                throw IllegalMove("Cannot unify '$nodeRelation' and '$closeRelation': ${e.message}")
            }

    if (!UnifierEquivalence.isMGUorNotUnifiable(unifier, nodeRelation, closeRelation))
        state.statusMessage = "The unifier you specified is not an MGU"

    // Apply all specified variable instantiations globally
    val instantiator = LogicNodeVariableInstantiator(unifier)
    state.nodes.forEach {
        it.formula = it.formula.accept(instantiator)
    }

    // Check relations after instantiation
    if (!nodeRelation.synEq(closeRelation))
        throw IllegalMove("Relations '$nodeRelation' and '$closeRelation' are" +
                " not equal after variable instantiation")

    // Close branch
    node.closeRef = closeID
    state.setClosed(nodeID)

    // Record close move for backtracking purposes
    if (state.backtracking) {
        val varAssignStrings = unifier.mapValues { it.value.toString() }
        val move = CloseMove(nodeID, closeID, varAssignStrings)
        state.moveHistory.add(move)
    }

    return state
}

/**
 * Check restrictions for nodeID and closeID
 */
private fun checkCloseIDRestrictions(state: NcTableauxState, nodeID: Int, closeID: Int) {
    val nodes = state.nodes

    checkNodeRestrictions(nodes, nodeID)

    if (closeID >= nodes.size || closeID < 0)
        throw IllegalMove("Node with ID $closeID does not exist")

    val node = state.nodes[nodeID]
    val closeNode = state.nodes[closeID]
    // Verify that closeNode is transitive parent of node
    if (!state.nodeIsParentOf(closeID, nodeID))
        throw IllegalMove("Node '$closeNode' is not an ancestor of node '$node'")
}

/**
 * Iff node and closeNode are (negated) Relations of compatible polarity then
 * @return Relations in input formulae
 */
@Suppress("ThrowsCount")
private fun checkCloseRelation(nodeFormula: LogicNode, closeNodeFormula: LogicNode): Pair<Relation, Relation> {
    when {
        nodeFormula is Not -> {
            if (nodeFormula.child !is Relation)
                throw IllegalMove("Node formula '$nodeFormula' is not a negated relation")
            if (closeNodeFormula !is Relation)
                throw IllegalMove("Close node formula '$closeNodeFormula' has to be a positive relation")
            val nodeRelation = nodeFormula.child as Relation
            return Pair(nodeRelation, closeNodeFormula)
        }
        closeNodeFormula is Not -> {
            if (closeNodeFormula.child !is Relation)
                throw IllegalMove("Close node formula '$closeNodeFormula' is not a negated relation")
            if (nodeFormula !is Relation)
                throw IllegalMove("Node formula '$nodeFormula' has to be a positive relation")
            val closeRelation = closeNodeFormula.child as Relation
            return Pair(nodeFormula, closeRelation)
        }
        else -> {
            throw IllegalMove("Neither '$nodeFormula' nor '$closeNodeFormula' are negated")
        }
    }
}

/**
 * Check nodeID valid + already closed
 */
fun checkNodeRestrictions(nodes: List<NcTableauxNode>, nodeID: Int) {
    if (nodeID < 0 || nodeID >= nodes.size)
        throw IllegalMove("Node with ID $nodeID does not exist")
    // Verify that node is not already closed
    val node = nodes[nodeID]
    if (node.isClosed)
        throw IllegalMove("Node '$node' is already closed")
}
