package kalkulierbar.logic

import kalkulierbar.logic.transform.FirstOrderTermVisitor

abstract class FirstOrderTerm {
    abstract fun <ReturnType> accept(visitor: FirstOrderTermVisitor<ReturnType>): ReturnType
    abstract fun clone(): FirstOrderTerm
}

class QuantifiedVariable(var spelling: String) : FirstOrderTerm() {
    override fun toString() = spelling
    override fun <ReturnType> accept(visitor: FirstOrderTermVisitor<ReturnType>) = visitor.visit(this)
    override fun clone() = QuantifiedVariable(spelling)
}

class Constant(val spelling: String) : FirstOrderTerm() {
    override fun toString() = spelling
    override fun <ReturnType> accept(visitor: FirstOrderTermVisitor<ReturnType>) = visitor.visit(this)
    override fun clone() = Constant(spelling)
}

class Function(val spelling: String, var arguments: List<FirstOrderTerm>) : FirstOrderTerm() {
    override fun toString() = "$spelling(${arguments.joinToString(", ")})"
    override fun <ReturnType> accept(visitor: FirstOrderTermVisitor<ReturnType>) = visitor.visit(this)
    override fun clone() = Function(spelling, arguments.map { it.clone() })
}
