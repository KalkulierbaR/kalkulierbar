package kalkulierbar.psc

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
import kalkulierbar.nonclausaltableaux.DeltaSkolemization
import kalkulierbar.nonclausaltableaux.NcTableauxNode
import kalkulierbar.nonclausaltableaux.NcTableauxState
import kalkulierbar.psc.PSCMove
import kalkulierbar.psc.PSC
import kalkulierbar.logic.UnaryOp

fun applyNotRight(state: PSCState, leafID: Int, listIndex: Int): PSCState {
    var leaf = state.tree[leafID];
    if (leaf.isLeaf == false)
        throw IllegalMove("Rule notRight can only be aplied to a leaf of the sequent calculus.")

    if (leaf.rightFormula.size <= listIndex || listIndex < 0)
        throw IllegalMove("Rule notRight must be applied on a valid formula of the selected Leaf.")

    val formula = leaf.rightFormula.get(listIndex)

    if (formula !is UnaryOp)
        throw IllegalMove("The rule notRight cannot be applied on BinaryOp")
        
    val newLeftFormula = leaf.leftFormula.toMutableList();
    newLeftFormula.add(formula.child);
    val newRightFormula = leaf.rightFormula.toMutableList();
    newRightFormula.removeAt(listIndex);

    var newLeaf = TreeNode(leafID, null, null, newLeftFormula.distinct().toMutableList(), newRightFormula.distinct().toMutableList())
    state.tree.add(newLeaf);
    leaf.leftChild = state.tree.size - 1;
    return state;
}

/**
 * While the outermost LogicNode is an AND:
 * Split into subformulae, chain onto a single branch
 * @param state: Non clausal tableaux state to apply move on
 * @param nodeID: node ID to apply move on
 * @return new state after applying move
 */
fun applyAlpha(state: PSCState, nodeID: Int): PSCState {
//    val nodes = state.nodes
//    checkNodeRestrictions(nodes , nodeID)
//
//    val node = nodes[nodeID]
//    val savedChildren = node.children.toMutableList() // Save a copy of the node's children
//    node.children.clear() // We will insert new nodes between the node and its children
//
//    if (node.formula !is And)
//        throw IllegalMove("Outermost logic operator is not AND")
//
//    val workList = mutableListOf(node.formula)
//    var parentID = nodeID
//
//    while (workList.isNotEmpty()) {
//        val subFormula = workList.removeAt(0)
//        if (subFormula is And) {
//            workList.add(subFormula.rightChild)
//            workList.add(subFormula.leftChild)
//        } else {
//            nodes.add(PSCNode(parentID, subFormula))
//            nodes[parentID].children.add(nodes.size - 1)
//            parentID = nodes.size - 1
//        }
//    }
//
//    // Add the node's children to the last inserted node to restore the tree structure
//    nodes[parentID].children.addAll(savedChildren)
//    state.setParent(savedChildren, nodes.size - 1)
//    // Add move to history
//    if (state.backtracking)
//        state.moveHistory.add(AlphaMove(nodeID))
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
        state: PSCState,
        nodeID: Int,
        closeID: Int,
        varAssign: Map<String, FirstOrderTerm>?
): PSCState{
    // checkCloseIDRestrictions(state, nodeID, closeID)

//    val node = state.nodes[nodeID]
//    val closeNode = state.nodes[closeID]
//    val nodeFormula = node.formula
//    val closeNodeFormula = closeNode.formula
//
//    // Verify that node and closeNode are (negated) Relations of compatible polarity
//    val (nodeRelation, closeRelation) = checkCloseRelation(nodeFormula, closeNodeFormula)
//
//    // Use user-supplied variable assignment if given, calculate MGU otherwise
//    val unifier: Map<String, FirstOrderTerm>
//    unifier = varAssign
//            ?: try {
//                Unification.unify(nodeRelation, closeRelation)
//            } catch (e: UnificationImpossible) {
//                throw IllegalMove("Cannot unify '$nodeRelation' and '$closeRelation': ${e.message}")
//            }
//
//    if (!UnifierEquivalence.isMGUorNotUnifiable(unifier, nodeRelation, closeRelation))
//        state.statusMessage = "The unifier you specified is not an MGU"
//
//    // Apply all specified variable instantiations globally
//    val instantiator = LogicNodeVariableInstantiator(unifier)
//    state.nodes.forEach {
//        it.formula = it.formula.accept(instantiator)
//    }
//
//    // Check relations after instantiation
//    if (!nodeRelation.synEq(closeRelation))
//        throw IllegalMove("Relations '$nodeRelation' and '$closeRelation' are" +
//                " not equal after variable instantiation")
//
//    // Close branch
//    node.closeRef = closeID
//    state.setClosed(nodeID)
//
//    // Record close move for backtracking purposes
//    if (state.backtracking) {
//        val varAssignStrings = unifier.mapValues { it.value.toString() }
//        val move = CloseMove(nodeID, closeID, varAssignStrings)
//        state.moveHistory.add(move)
//    }
//
    return state
}
