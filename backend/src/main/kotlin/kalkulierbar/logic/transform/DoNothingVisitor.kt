package kalkulierbar.logic.transform

import kalkulierbar.logic.And
import kalkulierbar.logic.Equiv
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.Impl
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier
import kalkulierbar.logic.Var

/**
 * Implements a default visitor recursively visiting an entire formula
 * Re-assigns all nodes with the node returned by the respective visit method
 * so that overriding implementations can replace/transform formula subtrees
 */
abstract class DoNothingVisitor : LogicNodeVisitor<LogicNode>() {
    /**
     * Visit an And-Operator and visit children recursively
     * @param node And-Operator to visit
     * @return the possibly transformed And-Operator node
     */
    override fun visit(node: And): LogicNode {
        node.leftChild = node.leftChild.accept(this)
        node.rightChild = node.rightChild.accept(this)
        return node
    }

    /**
     * Visit an Equivalence and visit children recursively
     * @param node Equivalence to visit
     * @return the possibly transformed Equivalence node
     */
    override fun visit(node: Equiv): LogicNode {
        node.leftChild = node.leftChild.accept(this)
        node.rightChild = node.rightChild.accept(this)
        return node
    }

    /**
     * Visit an Implication and visit children recursively
     * @param node Implication to visit
     * @return the possibly transformed Implication node
     */
    override fun visit(node: Impl): LogicNode {
        node.leftChild = node.leftChild.accept(this)
        node.rightChild = node.rightChild.accept(this)
        return node
    }

    /**
     * Visit an Not-operator and visit child recursively
     * @param node Not-Operator to visit
     * @return the possibly transformed Not-Operator node
     */
    override fun visit(node: Not): LogicNode {
        node.child = node.child.accept(this)
        return node
    }

    /**
     * Visit an Or node and visit children recursively
     * @param node Or-Operator to visit
     * @return the possibly transformed Or-Operator node
     */
    override fun visit(node: Or): LogicNode {
        node.leftChild = node.leftChild.accept(this)
        node.rightChild = node.rightChild.accept(this)
        return node
    }

    /**
     * Visit a Variable
     * This is a leaf node, so nothing happens
     * @param node Variable to visit
     * @return the Variable node
     */
    override fun visit(node: Var): LogicNode = node

    /**
     * Visit a Relation
     * This is a leaf node, so nothing happens
     * For transformations of FO terms, use a FirstOrderTermVisitor
     * @param node Relation to visit
     * @return the Relation node
     */
    override fun visit(node: Relation): LogicNode = node

    /**
     * Visit an Universal Quantifier and visit child recursively
     * @param node Universal Quantifier to visit
     * @return the possibly transformed UniversalQuantifier node
     */
    override fun visit(node: UniversalQuantifier): LogicNode {
        node.child = node.child.accept(this)
        return node
    }

    /**
     * Visit an Existential Quantifier and visit child recursively
     * @param node Existential Quantifier to visit
     * @return the possibly transformed ExistentialQuantifier node
     */
    override fun visit(node: ExistentialQuantifier): LogicNode {
        node.child = node.child.accept(this)
        return node
    }
}
