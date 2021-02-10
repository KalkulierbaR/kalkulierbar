
package kalkulierbar.signedtableaux

import kalkulierbar.IllegalMove
import kalkulierbar.UnificationImpossible
import kalkulierbar.logic.And
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Relation
import kalkulierbar.logic.Impl
import kalkulierbar.logic.UniversalQuantifier
import kalkulierbar.logic.transform.IdentifierCollector
import kalkulierbar.logic.transform.LogicNodeVariableInstantiator
import kalkulierbar.logic.transform.SelectiveSuffixAppender
import kalkulierbar.logic.util.Unification
import kalkulierbar.logic.util.UnifierEquivalence
import kalkulierbar.signedtableaux.AlphaMove
import kalkulierbar.signedtableaux.Negation

fun applyNegation(state: SignedModalTableauxState, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.nodes
    checkNodeRestrictions(nodes, nodeID)

    if(leafID == null){
        var leafs = state.childLeavesOf(nodeID)
        leafs.forEach {
            checkNodeRestrictions(nodes, it)
            applyNegation(state, nodeID, it)
        }
        return state;
    } 

    val node = nodes[nodeID]
    val leaf = nodes[leafID]
    val formula = node.formula

    if (formula !is Not)
        throw IllegalMove("Outermost logic operator is not NOT")

    nodes.add(SignedModalTableauxNode(leafID, node.prefix, !node.sign, formula.child));
    leaf.children.add(state.nodes.size - 1)

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(Negation(nodeID, leafID))
    return state
}

fun applyAlpha(state: SignedModalTableauxState, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.nodes
    checkNodeRestrictions(nodes, nodeID)

    if(leafID == null){
        var leafs = state.childLeavesOf(nodeID)
        leafs.forEach {
            checkNodeRestrictions(nodes, it)
            applyAlpha(state, nodeID, it)
        }
        return state;
    } 

    val node = nodes[nodeID]
    val leaf = nodes[leafID]
    val formula = node.formula
    
    if (formula is And){
        if(node.sign == false)
            throw IllegalMove("Operation can only be applied in AND if the sign is True")
        var leftFormula = formula.leftChild
        var rightFormula = formula.rightChild
        
        var alpha1 = SignedModalTableauxNode(leafID, node.prefix, true, leftFormula)
        nodes.add(alpha1)
        leaf.children.add(nodes.size - 1)
        var alpha2 = SignedModalTableauxNode(nodes.size - 1, node.prefix, true, rightFormula)
        nodes.add(alpha2)
        alpha1.children.add(nodes.size - 1)
    }
    else if(formula is Or){
        if(node.sign == true)
            throw IllegalMove("Operation can only be applied in OR if the sign is False")
        var leftFormula = formula.leftChild
        var rightFormula = formula.rightChild
        
        var alpha1 = SignedModalTableauxNode(leafID, node.prefix, false, leftFormula)
        nodes.add(alpha1)
        leaf.children.add(nodes.size - 1)
        var alpha2 = SignedModalTableauxNode(nodes.size - 1, node.prefix, false, rightFormula)
        nodes.add(alpha2)
        alpha1.children.add(nodes.size - 1)
    }
    else if(formula is Impl){
        if(node.sign == true)
            throw IllegalMove("Operation can only be applied in IMPL if the sign is False")
        var leftFormula = formula.leftChild
        var rightFormula = formula.rightChild
        
        var alpha1 = SignedModalTableauxNode(leafID, node.prefix, true , leftFormula)
        nodes.add(alpha1)
        leaf.children.add(nodes.size - 1)
        var alpha2 = SignedModalTableauxNode(nodes.size - 1, node.prefix, false, rightFormula)
        nodes.add(alpha2)
        alpha1.children.add(nodes.size - 1)
    }
    else{
        throw IllegalMove("Wrong")
    }

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(AlphaMove(nodeID, leafID))
    return state
}


/**
 * Check nodeID valid + already closed
 */
fun checkNodeRestrictions(nodes: List<SignedModalTableauxNode>, nodeID: Int) {
    if (nodeID < 0 || nodeID >= nodes.size)
        throw IllegalMove("Node with ID $nodeID does not exist")
    // Verify that node is not already closed
    val node = nodes[nodeID]
    if (node.isClosed)
        throw IllegalMove("Node '$node' is already closed")
}