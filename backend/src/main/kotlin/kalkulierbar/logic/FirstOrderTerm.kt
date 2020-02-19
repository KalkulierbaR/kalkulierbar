package kalkulierbar.logic

import kalkulierbar.logic.transform.FirstOrderTermVisitor
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule

// Context object for FO term serialization
// Tells kotlinx.serialize about child types of FirstOrderTerm
val FoTermModule = SerializersModule {
    polymorphic(FirstOrderTerm::class) {
        QuantifiedVariable::class with QuantifiedVariable.serializer()
        Function::class with Function.serializer()
        Constant::class with Constant.serializer()
    }
}

@Serializable
abstract class FirstOrderTerm : SyntacticEquality {
    abstract fun <ReturnType> accept(visitor: FirstOrderTermVisitor<ReturnType>): ReturnType

    /**
     * Create a deep copy of a term
     * NOTE: This will break quantifier linking
     * @return copy of the current term
     */
    abstract fun clone(): FirstOrderTerm
}

@Serializable
@SerialName("QuantifiedVariable")
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
@SerialName("Constant")
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
@SerialName("Function")
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
