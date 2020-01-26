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
    abstract fun clone(): FirstOrderTerm
    abstract fun synEq(other: Any?): Boolean
    override fun equals(other: Any?) = throw Exception("Fixme")
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

    override fun synEq(other: Any?): Boolean {
        if (other == null || !(other is Function) || spelling != other.spelling || arguments.size != other.arguments.size)
            return false

        for(i in arguments.indices) {
            if(!arguments[i].synEq(other.arguments[i]))
                return false
        }

        return true
    }
}
