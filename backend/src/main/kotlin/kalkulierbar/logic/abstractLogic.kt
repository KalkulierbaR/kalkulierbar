package kalkulierbar.logic

import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.transform.LogicNodeVisitor

abstract class LogicNode {

    /**
     * Translates arbitrary formulae into equivalent representations
     * using only basic operations (var, not, and, or)
     * @return representation of this LogicNode using only basic logic operations
     */
    abstract fun toBasicOps(): LogicNode

    /**
     * Transforms an arbitrary formula into a ClauseSet that is equivalent with regards to satisfiability
     * For more information, see https://en.wikipedia.org/wiki/Tseytin_transformation
     * NOTE: The resulting ClauseSet will contain additional variables, making the ClauseSet NOT equivalent
     *       to the input formula
     * @return ClauseSet of equal satisfiability as this logic node
     */
    fun tseytinCNF(): ClauseSet {
        val set = ClauseSet()

        // Add root node 
        set.add(Clause(mutableListOf(Atom(getTseytinName(0), false))))

        tseytin(set, 0) // Build ClauseSet recursively
        return set
    }

    abstract fun tseytin(cs: ClauseSet, index: Int): Int
    abstract fun getTseytinName(index: Int): String

    abstract fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>): ReturnType
}

abstract class BinaryOp(
    var leftChild: LogicNode,
    var rightChild: LogicNode
) : LogicNode() {

    /**
     * Translates arbitrary formulae into equivalent representations
     * using only basic operations (var, not, and, or)
     * @return representation of this LogicNode using only basic logic operations
     */
    override fun toBasicOps(): LogicNode {
        // Default behaviour: Assume this is a basic operation, do nothing
        // Make sure child subtrees are also basic operations
        leftChild = leftChild.toBasicOps()
        rightChild = rightChild.toBasicOps()
        return this
    }

    override fun toString(): String {
        return "( $leftChild bop $rightChild)"
    }
}

abstract class UnaryOp(var child: LogicNode) : LogicNode() {

    /**
     * Translates arbitrary formulae into equivalent representations
     * using only basic operations (var, not, and, or)
     * @return representation of this LogicNode using only basic logic operations
     */
    override fun toBasicOps(): LogicNode {
        // Default behaviour: Assume this is a basic operation, do nothing
        // Make sure child subtrees are also basic operations
        child = child.toBasicOps()
        return this
    }

    override fun toString(): String {
        return "(uop $child)"
    }
}
