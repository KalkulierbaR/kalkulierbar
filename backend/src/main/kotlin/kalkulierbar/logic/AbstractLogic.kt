package kalkulierbar.logic

import kalkulierbar.logic.transform.LogicNodeVisitor
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.polymorphic
import kotlinx.serialization.modules.subclass

// Context object for logic formula serialization
// Tells kotlinx.serialize about child types of LogicNode
val LogicModule = SerializersModule {
    polymorphic(LogicNode::class) {
        subclass(Var::class)
        subclass(Not::class)
        subclass(And::class)
        subclass(Or::class)
        subclass(Equiv::class)
        subclass(Impl::class)
        subclass(Relation::class)
        subclass(ExistentialQuantifier::class)
        subclass(UniversalQuantifier::class)
        subclass(Box::class)
        subclass(Diamond::class)
    }
}

@Serializable
abstract class LogicNode : SyntacticEquality {

    override fun clone() = clone(mapOf())

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

    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is UnaryOp) {
            return false
        }

        return this.child.synEq(other.child)
    }
}

abstract class Quantifier : UnaryOp() {
    abstract var varName: String
    abstract val boundVariables: MutableList<QuantifiedVariable>

    @Suppress("ReturnCount")
    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is Quantifier) {
            return false
        }

        if (this.varName != other.varName) {
            return false
        }

        if (this.boundVariables.size != other.boundVariables.size) {
            return false
        }

        for (i in this.boundVariables.indices) {
            if (!this.boundVariables[i].synEq(other.boundVariables[i])) {
                return false
            }
        }
        return true
    }
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

    /**
     * Create a deep copy of the object
     * @return copy of the current object
     */
    fun clone(): SyntacticEquality
}
