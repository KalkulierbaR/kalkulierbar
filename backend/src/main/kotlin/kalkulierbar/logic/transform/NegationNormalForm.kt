package kalkulierbar.logic.transform

import kalkulierbar.FormulaConversionException
import kalkulierbar.logic.And
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier

/**
 * Visitor-based transformation for FO-formulae into Negation Normal Form
 *
 * A formula in negation normal form has negations only directly applied on atomic
 * formulae and has only conjunction and disjunction as boolean operators
 * For more information, see https://en.wikipedia.org/wiki/Negation_normal_form
 *
 * Requires each quantified variable to be bound exactly once
 * An exception will be thrown if this requirement is not met
 */
class NegationNormalForm : DoNothingVisitor() {
    companion object Companion {
        /**
         * Apply the NNF transformation to a formula
         * @param formula Formula to transform
         * @return Equivalent formula in NNF
         */
        fun transform(formula: LogicNode): LogicNode {
            val instance = NegationNormalForm()
            val basicOps = ToBasicOps.transform(formula)
            return basicOps.accept(instance)
        }
    }

    /**
     * Perform negation pushdown to eliminate / move negations
     * @param node Negation encountered
     * @return Equivalent subformula in NNF
     */
    @Suppress("ComplexMethod")
    override fun visit(node: Not): LogicNode {
        val res: LogicNode

        // Perform Negation-Pushdown
        when (val child = node.child) {
            is Not -> {
                // Eliminate double negation
                res = child.child.accept(this)
            }
            is Or -> {
                // De-Morgan Or
                res = And(Not(child.leftChild), Not(child.rightChild)).accept(this)
            }
            is And -> {
                // De-Morgan And
                res = Or(Not(child.leftChild), Not(child.rightChild)).accept(this)
            }
            is UniversalQuantifier -> {
                res = ExistentialQuantifier(child.varName, Not(child.child), child.boundVariables).accept(this)
            }
            is ExistentialQuantifier -> {
                res = UniversalQuantifier(child.varName, Not(child.child), child.boundVariables).accept(this)
            }
            is Relation -> {
                res = node
            }
            else -> {
                val msg = "Unknown LogicNode encountered during Negation Normal Form transformation"
                throw FormulaConversionException(msg)
            }
        }

        return res
    }
}
