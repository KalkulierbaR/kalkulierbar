package kalkulierbar.logic

import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet

abstract class PropositionalLogicNode {
    abstract fun toBasicOps(): PropositionalLogicNode
    abstract fun naiveCNF(): ClauseSet
    abstract fun tseytin(cs: ClauseSet, index: Int): Int
    abstract fun getTseytinName(index: Int): String

    fun tseytinCNF(): ClauseSet {
        val set = ClauseSet()
        set.add(Clause(mutableListOf(Atom(getTseytinName(0), false))))
        tseytin(set, 0)
        return set
    }
}

abstract class BinaryOp(var leftChild: PropositionalLogicNode, var rightChild: PropositionalLogicNode) : PropositionalLogicNode() {
    override fun toBasicOps(): PropositionalLogicNode {
        leftChild = leftChild.toBasicOps()
        rightChild = rightChild.toBasicOps()
        return this
    }

    override fun toString(): String {
        return "( $leftChild bop $rightChild)"
    }
}

abstract class UnaryOp(var child: PropositionalLogicNode) : PropositionalLogicNode() {
    override fun toBasicOps(): PropositionalLogicNode {
        child = child.toBasicOps()
        return this
    }

    override fun toString(): String {
        return "(uop $child)"
    }
}
