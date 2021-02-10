
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

fun applyNotTrue(state: SignedModalTableauxState, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.nodes
    checkNodeRestrictions(nodes, nodeID)

    if(leafID == null){
        var leafs = state.childLeavesOf(nodeID)
        leafs.forEach {
            checkNodeRestrictions(nodes, it)
            applyNotTrue(state, nodeID, it)
        }
        return state;
    } 

    val node = nodes[nodeID]
    val leaf = nodes[leafID!!]

    if (node.formula !is Not)
        throw IllegalMove("Outermost logic operator is not NOT")

    nodes.add(SignedModalTableauxNode(leafID, node.prefix, !node.sign, node.formula));
    leaf.children.add(state.nodes.size - 1)

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(NotTrue(nodeID, leafID))
    return state
}

/*
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

 */