package kalkulierbar.logic.transform

import kalkulierbar.logic.And
import kalkulierbar.logic.Equiv
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.Impl
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier
import kalkulierbar.logic.Var

/**
 * Implements a default visitor recursively visiting an entire formula.
 * Does NOT re-assign LogicNodes so that overriding implementations can not modify formula.
 * -> Its purpose is to collect information in a class-variable from given formula
 */
abstract class DoNothingCollector : LogicNodeVisitor<Unit>() {

    /**
     * Visit an And-Operator and visit children recursively
     * @param node And-Operator to visit
     */
    override fun visit(node: And) {
        node.leftChild.accept(this)
        node.rightChild.accept(this)
    }

    /**
     * Visit an Equivalence and visit children recursively
     * @param node Equivalence to visit
     */
    override fun visit(node: Equiv) {
        node.leftChild.accept(this)
        node.rightChild.accept(this)
    }

    /**
     * Visit an Implication and visit children recursively
     * @param node Implication to visit
     */
    override fun visit(node: Impl) {
        node.leftChild.accept(this)
        node.rightChild.accept(this)
    }

    /**
     * Visit an Not-operator and visit child recursively
     * @param node Not-Operator to visit
     */
    override fun visit(node: Not) {
        node.child.accept(this)
    }

    /**
     * Visit an Or node and visit children recursively
     * @param node Or-Operator to visit
     */
    override fun visit(node: Or) {
        node.leftChild.accept(this)
        node.rightChild.accept(this)
    }

    /**
     * Visit a Variable
     * This is a leaf node, so nothing happens
     * @param node Variable to visit
     */
    override fun visit(node: Var) {
        return
    }

    /**
     * Visit a Relation
     * Functionallity for FirstOrderTerms has to be implemented
     * @param node Relation to visit
     */
    override fun visit(node: Relation) {
        return
    }

    /**
     * Visit an Universal Quantifier and visit child recursively
     * @param node Universal Quantifier to visit
     */
    override fun visit(node: UniversalQuantifier) {
        node.child.accept(this)
    }

    /**
     * Visit an Existential Quantifier and visit child recursively
     * @param node Existential Quantifier to visit
     */
    override fun visit(node: ExistentialQuantifier) {
        node.child.accept(this)
    }
}
