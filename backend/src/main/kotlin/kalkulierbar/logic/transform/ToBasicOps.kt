package kalkulierbar.logic.transform

import kalkulierbar.logic.And
import kalkulierbar.logic.Equiv
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.Impl
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Quantifier
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier

class ToBasicOps : DoNothingVisitor() {

    companion object Companion {
        fun transform(formula: LogicNode): LogicNode {
            val instance = ToBasicOps()
            return formula.accept(instance)
        }
    }

    private val quantifiers = mutableListOf<Quantifier>()

    override fun visit(node: Impl): LogicNode {
        val left = node.leftChild.accept(this)
        val right = node.rightChild.accept(this)
        return Or(Not(left), right)
    }

    override fun visit(node: Equiv): LogicNode {
        val left = node.leftChild
        val right = node.rightChild

        val bothTrue = And(left, right)
        val bothFalse = And(Not(left.clone()), Not(right.clone()))

        return Or(bothTrue, bothFalse).accept(this)
    }

    /**
     * Add an universal quantifier to the quantifier scope when
     * transforming its child node to enable variable re-linking
     * @param node UniversalQuantifier encountered
     * @return Universal quantifier with child sub-formula transformed to basic ops
     */
    override fun visit(node: UniversalQuantifier): LogicNode {
        // Clear associated variables as we will re-link later
        node.boundVariables.clear()
        quantifiers.add(node)
        node.child = node.child.accept(this)
        quantifiers.removeAt(quantifiers.size - 1)
        return node
    }

    /**
     * Add an existential quantifier to the quantifier scope when
     * transforming its child node to enable variable re-linking
     * @param node ExistentialQuantifier encountered
     * @return Existential quantifier with child sub-formula transformed to basic ops
     */
    override fun visit(node: ExistentialQuantifier): LogicNode {
        // Clear associated variables as we will re-link later
        node.boundVariables.clear()
        quantifiers.add(node)
        node.child = node.child.accept(this)
        quantifiers.removeAt(quantifiers.size - 1)
        return node
    }

    /**
     * Re-create quantifier linking as the clone function
     * may have left the formula in an inconsistent state
     * @param node Relation encountered
     * @return unchanged relation
     */
    override fun visit(node: Relation): LogicNode {
        val linker = QuantifierLinker(quantifiers, false)

        node.arguments.forEach {
            it.accept(linker)
        }

        return node
    }
}
