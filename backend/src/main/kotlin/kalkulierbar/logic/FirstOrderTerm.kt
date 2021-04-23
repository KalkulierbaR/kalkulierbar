package kalkulierbar.logic

import kalkulierbar.logic.transform.FirstOrderTermVisitor
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.polymorphic
import kotlinx.serialization.modules.subclass

// Context object for FO term serialization
// Tells kotlinx.serialize about child types of FirstOrderTerm
val FoTermModule = SerializersModule {
    polymorphic(FirstOrderTerm::class) {
        subclass(QuantifiedVariable::class)
        subclass(Function::class)
        subclass(Constant::class)
    }
}

@Serializable
abstract class FirstOrderTerm : SyntacticEquality {
    abstract fun <ReturnType> accept(visitor: FirstOrderTermVisitor<ReturnType>): ReturnType

    /**
     * Create a deep copy of a term
     * @return copy of the current term
     */
    abstract fun clone(qm: Map<String, Quantifier>): FirstOrderTerm

    // Implement simple clone function required by SynEq
    override fun clone() = clone(mapOf())
}

@Serializable
@SerialName("QuantifiedVariable")
class QuantifiedVariable(var spelling: String) : FirstOrderTerm() {
    override fun toString() = spelling
    override fun <ReturnType> accept(visitor: FirstOrderTermVisitor<ReturnType>) = visitor.visit(this)

    override fun clone(qm: Map<String, Quantifier>): QuantifiedVariable {
        val newVar = QuantifiedVariable(spelling)

        // Register the new variable with a binding quantifier, should one exist
        if (qm[spelling] != null)
            qm[spelling]!!.boundVariables.add(newVar)

        return newVar
    }

    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is QuantifiedVariable)
            return false

        return spelling == other.spelling
    }
}

@Serializable
@SerialName("Constant")
class Constant(val spelling: String) : FirstOrderTerm() {
    override fun toString() = spelling
    override fun <ReturnType> accept(visitor: FirstOrderTermVisitor<ReturnType>) = visitor.visit(this)
    override fun clone(qm: Map<String, Quantifier>) = Constant(spelling)

    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is Constant)
            return false

        return spelling == other.spelling
    }
}

@Serializable
@SerialName("Function")
class Function(val spelling: String, var arguments: List<FirstOrderTerm>) : FirstOrderTerm() {
    override fun toString() = "$spelling(${arguments.joinToString(", ")})"
    override fun <ReturnType> accept(visitor: FirstOrderTermVisitor<ReturnType>) = visitor.visit(this)
    override fun clone(qm: Map<String, Quantifier>) = Function(spelling, arguments.map { it.clone(qm) })

    @Suppress("ReturnCount")
    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is Function)
            return false

        if (spelling != other.spelling || arguments.size != other.arguments.size)
            return false

        for (i in arguments.indices) {
            if (!arguments[i].synEq(other.arguments[i]))
                return false
        }

        return true
    }
}
