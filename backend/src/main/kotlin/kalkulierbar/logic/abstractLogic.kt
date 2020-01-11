package kalkulierbar.logic

import kalkulierbar.logic.transform.LogicNodeVisitor

abstract class LogicNode {

    /**
     * Translates arbitrary formulae into equivalent representations
     * using only basic operations (var, not, and, or)
     * @return representation of this LogicNode using only basic logic operations
     */
    abstract fun toBasicOps(): LogicNode

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
