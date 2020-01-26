package kalkulierbar.logic

import kalkulierbar.logic.transform.FirstOrderTermVisitor
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule

val FoTermModule = SerializersModule {
    polymorphic(FirstOrderTerm::class) {
        QuantifiedVariable::class with QuantifiedVariable.serializer()
        Function::class with Function.serializer()
        Constant::class with Constant.serializer()
    }
}

@Serializable
abstract class FirstOrderTerm {
    abstract fun <ReturnType> accept(visitor: FirstOrderTermVisitor<ReturnType>): ReturnType

    /**
     * Create a deep copy of a term
     * NOTE: This will break quantifier linking
     * @return copy of the current term
     */
    abstract fun clone(): FirstOrderTerm

    /**
     * Check if two terms are syntactically (as opposed to referentially) identical
     * @param other Object to check for syntactic equality
     * @return true iff the terms are equal
     */
    abstract fun synEq(other: Any?): Boolean

    /**
     * Leftover from previous implementation
     * I am not sure if any functionality still depends on equality of FO terms
     * possibly assuming syntactic equality
     * So we will throw an exception to draw attention to any such cases
     */
    // FIXME
    override fun equals(other: Any?) = throw Exception("Equality used on First-Order Term")
}

@Serializable
class QuantifiedVariable(var spelling: String) : FirstOrderTerm() {
    override fun toString() = spelling
    override fun <ReturnType> accept(visitor: FirstOrderTermVisitor<ReturnType>) = visitor.visit(this)
    override fun clone() = QuantifiedVariable(spelling)

    override fun synEq(other: Any?): Boolean {
        if (other == null || !(other is QuantifiedVariable))
            return false

        return spelling == other.spelling
    }
}

@Serializable
class Constant(val spelling: String) : FirstOrderTerm() {
    override fun toString() = spelling
    override fun <ReturnType> accept(visitor: FirstOrderTermVisitor<ReturnType>) = visitor.visit(this)
    override fun clone() = Constant(spelling)

    override fun synEq(other: Any?): Boolean {
        if (other == null || !(other is Constant))
            return false

        return spelling == other.spelling
    }
}

@Serializable
class Function(val spelling: String, var arguments: List<FirstOrderTerm>) : FirstOrderTerm() {
    override fun toString() = "$spelling(${arguments.joinToString(", ")})"
    override fun <ReturnType> accept(visitor: FirstOrderTermVisitor<ReturnType>) = visitor.visit(this)
    override fun clone() = Function(spelling, arguments.map { it.clone() })

    @Suppress("ReturnCount")
    override fun synEq(other: Any?): Boolean {
        if (other == null || !(other is Function))
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
