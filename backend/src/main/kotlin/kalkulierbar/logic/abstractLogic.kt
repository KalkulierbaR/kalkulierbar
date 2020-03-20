package kalkulierbar.logic

import kalkulierbar.logic.transform.LogicNodeVisitor
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule

// Context object for logic formula serialization
// Tells kotlinx.serialize about child types of LogicNode
val LogicModule = SerializersModule {
    polymorphic(LogicNode::class) {
        Var::class with Var.serializer()
        Not::class with Not.serializer()
        And::class with And.serializer()
        Or::class with Or.serializer()
        Impl::class with Impl.serializer()
        Equiv::class with Equiv.serializer()
        Relation::class with Relation.serializer()
        ExistentialQuantifier::class with ExistentialQuantifier.serializer()
        UniversalQuantifier::class with UniversalQuantifier.serializer()
    }
}

@Serializable
abstract class LogicNode {

    /**
     * Create a deep copy of a logic node
     * @return copy of the current logic node
     */
    abstract fun clone(qm: Map<String, Quantifier> = mapOf()): LogicNode

    abstract fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>): ReturnType
}

abstract class BinaryOp : LogicNode() {

    abstract var leftChild: LogicNode
    abstract var rightChild: LogicNode

    override fun toString(): String {
        return "( $leftChild bop $rightChild)"
    }
}

abstract class UnaryOp : LogicNode() {
    abstract var child: LogicNode

    override fun toString(): String {
        return "(uop $child)"
    }
}

abstract class Quantifier : UnaryOp() {
    abstract var varName: String
    abstract val boundVariables: MutableList<QuantifiedVariable>
}

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
