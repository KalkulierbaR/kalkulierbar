package kalkulierbar.logic.transform

import kalkulierbar.logic.Constant
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.Function
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier

/**
 * Collects free variables in a logic-node formula structure
 */
class FreeVariableCollector : DoNothingCollector() {

    companion object {
        private val instance = FreeVariableCollector()

        /**
         * Collects a set of free variables in a logic-node structure
         * @param formula formula to search for free variables
         * @return a set of free variables not bound to any quantifier
         */
        fun collect(formula: LogicNode): Set<QuantifiedVariable> {
            instance.freeVariables.clear()
            instance.boundVariables.clear()
            formula.accept(instance)
            return instance.freeVariables
        }
    }

    private val freeVariables = mutableSetOf<QuantifiedVariable>()
    private val boundVariables = mutableSetOf<QuantifiedVariable>()

    override fun visit(node: Relation) {
        val freeTermCollector = FreeVariableTermCollector(boundVariables)
        node.arguments.forEach {
            freeVariables.addAll(it.accept(freeTermCollector))
        }
    }

    override fun visit(node: UniversalQuantifier) {
        boundVariables.addAll(node.boundVariables)
        node.child.accept(this)
    }

    override fun visit(node: ExistentialQuantifier) {
        boundVariables.addAll(node.boundVariables)
        node.child.accept(this)
    }
}

/**
 * Collects free variables from a first-order term
 * @param boundVariables: set of bound variables to compare with variables in first-order term
 */
class FreeVariableTermCollector(
    val boundVariables: Set<QuantifiedVariable>,
) : FirstOrderTermVisitor<Set<QuantifiedVariable>>() {
    override fun visit(node: Constant): Set<QuantifiedVariable> {
        return mutableSetOf()
    }

    override fun visit(node: QuantifiedVariable): Set<QuantifiedVariable> {
        // return node if free
        return if (boundVariables.contains(node)) {
            mutableSetOf()
        } else {
            mutableSetOf(node)
        }
    }

    override fun visit(node: Function): Set<QuantifiedVariable> {
        val set = mutableSetOf<QuantifiedVariable>()
        node.arguments.forEach {
            set.addAll(it.accept(this))
        }
        return set
    }
}
