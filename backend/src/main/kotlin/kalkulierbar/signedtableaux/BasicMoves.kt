
package kalkulierbar.signedtableaux

import kalkulierbar.IllegalMove
import kalkulierbar.UnificationImpossible
import kalkulierbar.logic.And
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

fun applyNotTrue(state: SignedModalTableauxState, nodeID: Int): SignedModalTableauxState {
    val nodes = state.nodes
    checkNodeRestrictions(nodes, nodeID)

    val node = nodes[nodeID]
    val savedChildren = node.children.toMutableList() // Save a copy of the node's children
    node.children.clear() // We will insert new nodes between the node and its children

    if (node.formula !is Not)
        throw IllegalMove("Outermost logic operator is not NOT")


    // Add the node's children to the last inserted node to restore the tree structure
    nodes[parentID].children.addAll(savedChildren)
    state.setParent(savedChildren, nodes.size - 1)
    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(AlphaMove(nodeID))
    return state
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