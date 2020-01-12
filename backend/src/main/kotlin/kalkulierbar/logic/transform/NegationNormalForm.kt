package kalkulierbar.logic.transform

import kalkulierbar.FormulaConversionException
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

class NegationNormalForm : DoNothingVisitor() {

    companion object Companion {
        fun transform(formula: LogicNode): LogicNode {
            val instance = NegationNormalForm()
            return formula.accept(instance)
        }
    }

    override fun visit(node: Not): LogicNode {
        val res: LogicNode
        val child = node.child

        // Perform Negation-Pushdown
        when (child) {
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
            is Impl -> {
                // !(a->b) = !(!a v b) = a^!b
                res = And(child.leftChild, Not(child.rightChild)).accept(this)
            }
            is Equiv -> {
                val implA = Impl(child.leftChild, child.rightChild)
                val implB = Impl(child.rightChild, child.leftChild)
                // Translate equivalence into implications
                res = Not(And(implA, implB)).accept(this)
            }
            is UniversalQuantifier -> {
                res = ExistentialQuantifier(child.varName, Not(child.child), child.boundVariables).accept(this)
            }
            is ExistentialQuantifier -> {
                res = UniversalQuantifier(child.varName, Not(child.child), child.boundVariables).accept(this)
            }
            is Var -> {
                res = node
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
