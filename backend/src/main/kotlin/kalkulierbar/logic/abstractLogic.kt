package kalkulierbar.logic

import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet

abstract class PropositionalLogicNode {

    /**
     * Translates arbitrary formulae into equivalent representations
     * using only basic operations (var, not, and, or)
     * @return representation of this LogicNode using only basic logic operations
     */
    abstract fun toBasicOps(): PropositionalLogicNode

    /**
     * Translates an arbitrary fomula into an equivalent ClauseSet using naive conversion to CNF
     * Algorithm adapted from https://www.cs.jhu.edu/~jason/tutorials/convert-to-CNF.html
     * @return ClauseSet equivalent to this logic node
     */
    abstract fun naiveCNF(): ClauseSet

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
}

abstract class BinaryOp(var leftChild: PropositionalLogicNode, var rightChild: PropositionalLogicNode) : PropositionalLogicNode() {

    /**
     * Translates arbitrary formulae into equivalent representations
     * using only basic operations (var, not, and, or)
     * @return representation of this LogicNode using only basic logic operations
     */
    override fun toBasicOps(): PropositionalLogicNode {
        // Default behaviour: Assume this is a basic operation, do nothing
        // Make sure child subtrees are also basic operations
        leftChild = leftChild.toBasicOps()
        rightChild = rightChild.toBasicOps()
        return this
    }

    override fun toString(): String {
        return "( $leftChild bop $rightChild)"
    }

    override fun equals(other: Any?): Boolean {
        if (other !is BinaryOp)
            return false
        return other::class == this::class
                && leftChild == other.leftChild
                && rightChild == other.rightChild
    }
}

abstract class UnaryOp(var child: PropositionalLogicNode) : PropositionalLogicNode() {

    /**
     * Translates arbitrary formulae into equivalent representations
     * using only basic operations (var, not, and, or)
     * @return representation of this LogicNode using only basic logic operations
     */
    override fun toBasicOps(): PropositionalLogicNode {
        // Default behaviour: Assume this is a basic operation, do nothing
        // Make sure child subtrees are also basic operations
        child = child.toBasicOps()
        return this
    }

    override fun toString(): String {
        return "(uop $child)"
    }

    override fun equals(other: Any?): Boolean {
        if (other !is UnaryOp)
            return false
        return other::class == this::class
                && child == other.child
    }
}
