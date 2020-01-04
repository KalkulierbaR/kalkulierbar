package kalkulierbar.logic

abstract class FirstOrderTerm()

class QuantifiedVariable(var spelling: String) : FirstOrderTerm() {
    override fun toString() = spelling
}

class Constant(val spelling: String) : FirstOrderTerm() {
    override fun toString() = spelling
}

class Function(val spelling: String, val arguments: List<FirstOrderTerm>) : FirstOrderTerm() {
    override fun toString() = "$spelling(${arguments.joinToString(", ")})"
}
