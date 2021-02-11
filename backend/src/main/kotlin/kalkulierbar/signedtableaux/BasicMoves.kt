
package kalkulierbar.signedtableaux

import kalkulierbar.IllegalMove
import kalkulierbar.UnificationImpossible
import kalkulierbar.logic.And
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Relation
import kalkulierbar.logic.Impl
import kalkulierbar.logic.Box
import kalkulierbar.logic.Diamond
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
        throw IllegalMove("Alpha Rule can not be applied on the node $node")
    }

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(AlphaMove(nodeID, leafID))
    return state
}


fun applyBeta(state: SignedModalTableauxState, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.nodes
    checkNodeRestrictions(nodes, nodeID)

    if(leafID == null){
        var leafs = state.childLeavesOf(nodeID)
        leafs.forEach {
            checkNodeRestrictions(nodes, it)
            applyBeta(state, nodeID, it)
        }
        return state;
    } 

    val node = nodes[nodeID]
    val leaf = nodes[leafID]
    val formula = node.formula
    
    if (formula is And){
        if(node.sign == true)
            throw IllegalMove("Operation can only be applied in AND if the sign is True")
        var leftFormula = formula.leftChild
        var rightFormula = formula.rightChild
        
        var beta1 = SignedModalTableauxNode(leafID, node.prefix, false, leftFormula)
        nodes.add(beta1)
        leaf.children.add(nodes.size - 1)
        var beta2 = SignedModalTableauxNode(leafID, node.prefix, false, rightFormula)
        nodes.add(beta2)
        leaf.children.add(nodes.size - 1)
    }
    else if(formula is Or){
        if(node.sign == false)
            throw IllegalMove("Operation can only be applied in OR if the sign is False")
        var leftFormula = formula.leftChild
        var rightFormula = formula.rightChild
        
        var beta1 = SignedModalTableauxNode(leafID, node.prefix, true, leftFormula)
        nodes.add(beta1)
        leaf.children.add(nodes.size - 1)
        var beta2 = SignedModalTableauxNode(leafID, node.prefix, true, rightFormula)
        nodes.add(beta2)
        leaf.children.add(nodes.size - 1)
    }
    else if(formula is Impl){
        if(node.sign == false)
            throw IllegalMove("Operation can only be applied in IMPL if the sign is False")
        var leftFormula = formula.leftChild
        var rightFormula = formula.rightChild
        
        var beta1 = SignedModalTableauxNode(leafID, node.prefix, false, leftFormula)
        nodes.add(beta1)
        leaf.children.add(nodes.size - 1)
        var beta2 = SignedModalTableauxNode(leafID, node.prefix, true, rightFormula)
        nodes.add(beta2)
        leaf.children.add(nodes.size - 1)
    }
    else{
        throw IllegalMove("Beta Rule can not be applied on the node $node")
    }

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(BetaMove(nodeID, leafID))
    return state
}

fun applyNu(state: SignedModalTableauxState, prefix: Int, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.nodes
    checkNodeRestrictions(nodes, nodeID)

    if(leafID == null){
        var leafs = state.childLeavesOf(nodeID)
        leafs.forEach {
            checkNodeRestrictions(nodes, it)
            applyNu(state, prefix, nodeID, it)
        }
        return state;
    } 

    val node = nodes[nodeID]
    val leaf = nodes[leafID]
    val formula = node.formula

    var newPrefix = node.prefix.toMutableList()
    newPrefix.add(prefix)

    if(!state.prefixIsUsedOnBranch(leafID, newPrefix))
        throw IllegalMove("Prefix has to be already in use on the selected branch")
    
    if (formula is Box){
        if(node.sign == false)
            throw IllegalMove("Operation can only be applied in BOX if the sign is True")
        var childFormula = formula.child

        var nu0 = SignedModalTableauxNode(leafID, newPrefix, true, childFormula)
        nodes.add(nu0)
        leaf.children.add(nodes.size - 1)
    }
    else if(formula is Diamond){
        if(node.sign == true)
            throw IllegalMove("Operation can only be applied in DIAMOND if the sign is False")
        var childFormula = formula.child
        
        var nu0 = SignedModalTableauxNode(leafID, newPrefix, false, childFormula)
        nodes.add(nu0)
        leaf.children.add(nodes.size - 1)
    }
    else{
        throw IllegalMove("Nu Rule can not be applied on the node $node")
    }

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(NuMove(prefix, nodeID, leafID))
    return state
}

fun applyPi(state: SignedModalTableauxState, prefix: Int, nodeID: Int, leafID: Int?): SignedModalTableauxState {
    val nodes = state.nodes
    checkNodeRestrictions(nodes, nodeID)

    if(leafID == null){
        var leafs = state.childLeavesOf(nodeID)
        leafs.forEach {
            checkNodeRestrictions(nodes, it)
            applyPi(state, prefix, nodeID, it)
        }
        return state;
    } 

    val node = nodes[nodeID]
    val leaf = nodes[leafID]
    val formula = node.formula

    var newPrefix = node.prefix.toMutableList()
    newPrefix.add(prefix)

    if(state.prefixIsUsedOnBranch(leafID, newPrefix))
        throw IllegalMove("Prefix has to not be already in use on the selected branch")
    
    if (formula is Box){
        if(node.sign == true)
            throw IllegalMove("Operation can only be applied in BOX if the sign is False")
        var childFormula = formula.child

        var nu0 = SignedModalTableauxNode(leafID, newPrefix, false, childFormula)
        nodes.add(nu0)
        leaf.children.add(nodes.size - 1)
    }
    else if(formula is Diamond){
        if(node.sign == false)
            throw IllegalMove("Operation can only be applied in DIAMOND if the sign is True")
        var childFormula = formula.child
        
        var nu0 = SignedModalTableauxNode(leafID, newPrefix, true, childFormula)
        nodes.add(nu0)
        leaf.children.add(nodes.size - 1)
    }
    else{
        throw IllegalMove("Pi Rule can not be applied on the node $node")
    }

    // Add move to history
    if (state.backtracking)
        state.moveHistory.add(PiMove(prefix, nodeID, leafID))
    return state
}

fun applyClose(state: SignedModalTableauxState, nodeID: Int, leafID: Int): SignedModalTableauxState {
    val nodes = state.nodes
    checkCloseIDRestrictions(state, nodeID, leafID)

    val node = nodes[nodeID]
    val leaf = nodes[leafID]

    if(node.sign == leaf.sign)
        throw IllegalMove("The selected formulas are not of opposite sign.")

    if(!node.prefix.equals(leaf.prefix))
        throw IllegalMove("The selected formulas do not have the same prefix.")
    
    if(!node.formula.synEq(leaf.formula))
        throw IllegalMove("The selected formula is not syntactically equivalent.")
    
    node.closeRef = leafID
    leaf.closeRef = nodeID
    state.setClosed(leafID)
    
    if (state.backtracking)
        state.moveHistory.add(CloseMove(nodeID, leafID))

    return state
}

/**
 * Check restrictions for nodeID and closeID
 */
private fun checkCloseIDRestrictions(state: SignedModalTableauxState, nodeID: Int, closeID: Int) {
    val nodes = state.nodes

    checkNodeRestrictions(nodes, nodeID)

    if (closeID >= nodes.size || closeID < 0)
        throw IllegalMove("Node with ID $closeID does not exist")

    val node = state.nodes[nodeID]
    val closeNode = state.nodes[closeID]
    // Verify that closeNode is transitive parent of node
    if (!state.nodeIsParentOf(nodeID, closeID))
        throw IllegalMove("Node '$closeNode' is not an ancestor of node '$node'")

    if(!closeNode.isLeaf)
        throw IllegalMove("Node '$closeNode' is not a Leaf.")
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