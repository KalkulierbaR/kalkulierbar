package main.kotlin.kalkulierbar.logic.transform

import kalkulierbar.logic.And
import kalkulierbar.logic.Equiv
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.transform.DoNothingVisitor

class ChangeEquivalences : DoNothingVisitor() {
    companion object Companion {

        fun transform(formula: LogicNode): LogicNode {
            val instance = ChangeEquivalences()
            return formula.accept(instance)
        }
    }

    override fun visit(node: Equiv): LogicNode {
        val left = node.leftChild
        val right = node.rightChild

        // Cloning the sub-terms here is important!
        // Not cloning leads to object-reuse which causes all sorts of weirdness
        // especially when used with Quantifiers
        val bothTrue = And(left, right)
        val bothFalse = And(Not(left.clone()), Not(right.clone()))

        return Or(bothTrue, bothFalse).accept(this)
    }
}
