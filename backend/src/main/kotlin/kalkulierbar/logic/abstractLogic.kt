package kalkulierbar.logic

import kalkulierbar.logic.transform.LogicNodeVisitor

abstract class LogicNode {

    /**
     * Create a deep copy of a logic node
     * NOTE: This will break quantifier linking
     * @return copy of the current logic node
     */
    abstract fun clone(): LogicNode

    abstract fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>): ReturnType
}

abstract class BinaryOp(
    var leftChild: LogicNode,
    var rightChild: LogicNode
) : LogicNode() {
    override fun toString(): String {
        return "( $leftChild bop $rightChild)"
    }
}

abstract class UnaryOp(var child: LogicNode) : LogicNode() {
    override fun toString(): String {
        return "(uop $child)"
    }
}

abstract class Quantifier(
    var varName: String,
    child: LogicNode,
    val boundVariables: MutableList<QuantifiedVariable>
) : UnaryOp(child)

/**
 * Interface defining a function to check syntactic equality
 */
interface SyntacticEquality {

    /**
     * Check if two terms are syntactically (as opposed to referentially) identical
     * @param other Object to check for syntactic equality
     * @return true iff the terms are equal
     */
    fun synEq(other: Any?): Boolean
}
