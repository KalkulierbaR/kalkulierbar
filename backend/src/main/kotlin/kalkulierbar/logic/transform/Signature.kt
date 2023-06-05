package main.kotlin.kalkulierbar.logic.transform

import kalkulierbar.IncorrectArityException
import kalkulierbar.UnknownFunctionException
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.*
import kalkulierbar.logic.Function
import kalkulierbar.logic.transform.DoNothingCollector
import kalkulierbar.logic.transform.FirstOrderTermVisitor

data class CompoundSignature(val name: String, val arity: Int) {
    override fun toString(): String {
        return "$name($arity)"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as CompoundSignature

        if (name != other.name) return false
        return arity == other.arity
    }

    override fun hashCode(): Int {
        var result = name.hashCode()
        result = 31 * result + arity
        return result
    }
}

data class Signature(
    val constants: Set<String>,
    val functions: Set<CompoundSignature>,
    val relations: Set<CompoundSignature>,
    val boundVariables: Set<String>,
) {
    companion object {
        fun empty(): Signature {
            return Signature(
                constants = setOf(), functions = setOf(),
                relations = setOf(), boundVariables = setOf()
            )
        }

        fun of(formula: LogicNode): Signature {
            return SignatureExtractor.extract(formula)
        }

        fun of(formulas: Collection<LogicNode>): Signature {
            var sig = empty()
            formulas.forEach { sig += of(it) }
            return sig
        }

        fun of(clauseSet: ClauseSet<Relation>): Signature {
            var sig = empty()
            clauseSet.clauses.flatMap { it.atoms }.forEach { sig += of(it.lit) }
            return sig
        }
    }

    fun getAllIdentifiers(): Set<String> {
        return getConstantsAndFunctionNames() + relations.map { it.name } + boundVariables
    }

    fun getConstantsAndFunctionNames(): Set<String> {
        return constants + functions.map { it.name }
    }

    fun getFunctionArity(name: String): Int? {
        return functions.find { it.name == name }?.arity
    }

    operator fun plus(sig: Signature): Signature {
        return Signature(
            constants = constants + sig.constants,
            functions = functions + sig.functions,
            relations = relations + sig.relations,
            boundVariables = boundVariables + sig.boundVariables
        )
    }

    fun hasConst(c: String): Boolean {
        return constants.contains(c)
    }

    fun hasFunction(name: String): Boolean {
        return functions.any { it.name == name }
    }

    fun hasConstOrFunction(name: String): Boolean {
        return hasConst(name) || hasFunction(name)
    }

    fun check(term: FirstOrderTerm) {
        val checker = SignatureAdherenceChecker(this)
        term.accept(checker)
    }

    override fun toString(): String {
        val c = constants.joinToString(", ")
        val f = functions.joinToString(", ")
        val r = relations.joinToString(", ")
        val b = boundVariables.joinToString(", ")
        return "Σ(constants={$c}, functions={$f}, relations={$r}, bound={$b})"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Signature

        if (constants != other.constants) return false
        if (functions != other.functions) return false
        if (relations != other.relations) return false
        return boundVariables == other.boundVariables
    }

    override fun hashCode(): Int {
        var result = constants.hashCode()
        result = 31 * result + functions.hashCode()
        result = 31 * result + relations.hashCode()
        result = 31 * result + boundVariables.hashCode()
        return result
    }
}

class SignatureExtractor : DoNothingCollector() {
    companion object {
        private val instance = SignatureExtractor()

        /**
         * Collect a set of all identifiers used in a formula
         * Including: Variables, constants, function- and relation names
         * @param formula Formula to collect identifiers from
         * @return Set of all identifiers found
         */
        fun extract(formula: LogicNode): Signature {
            instance.constants.clear()
            instance.functions.clear()
            instance.relations.clear()
            instance.boundVariables.clear()
            formula.accept(instance)
            return Signature(
                constants = instance.constants,
                functions = instance.functions,
                relations = instance.relations,
                boundVariables = instance.boundVariables
            )
        }
    }

    private val constants = mutableSetOf<String>()
    private val functions = mutableSetOf<CompoundSignature>()
    private val relations = mutableSetOf<CompoundSignature>()
    private val boundVariables = mutableSetOf<String>()

    private val termSigExtr = TermSignatureExtractor(constants, functions, boundVariables)

    override fun visit(node: Relation) {
        relations.add(CompoundSignature(name = node.spelling, arity = node.arguments.size))
        node.arguments.forEach { it.accept(termSigExtr) }
    }

    override fun visit(node: UniversalQuantifier) {
        boundVariables.add(node.varName)
        node.child.accept(this)
    }

    override fun visit(node: ExistentialQuantifier) {
        boundVariables.add(node.varName)
        node.child.accept(this)
    }
}

class TermSignatureExtractor(
    private val constants: MutableSet<String>,
    private val functions: MutableSet<CompoundSignature>,
    private val boundVars: MutableSet<String>,
) : FirstOrderTermVisitor<Unit>() {
    override fun visit(node: Constant) {
        constants.add(node.spelling)
    }

    override fun visit(node: Function) {
        functions.add(CompoundSignature(name = node.spelling, arity = node.arguments.size))
        node.arguments.forEach { it.accept(this) }
    }

    override fun visit(node: QuantifiedVariable) {
        boundVars.add(node.spelling)
    }
}

class SignatureAdherenceChecker(
    private val sig: Signature,
    private val allowNewConstants: Boolean = true
) : FirstOrderTermVisitor<Unit>() {

    override fun visit(node: Constant) {
        if (!allowNewConstants && !sig.hasConst(node.spelling)) {
            throw UnknownFunctionException("Unknown constant '${node.spelling}'")
        }
        if (sig.hasFunction(node.spelling)) {
            throw IncorrectArityException("Identifier '${node.spelling}' is used both as a function and a constant")
        }
    }

    override fun visit(node: QuantifiedVariable) {}

    override fun visit(node: Function) {
        if (!sig.hasFunction(node.spelling)) {
            throw UnknownFunctionException("Unknown function '${node.spelling}'")
        }
        val arity = node.arguments.size
        val expected = sig.getFunctionArity(node.spelling)

        if (arity != expected) {
            throw IncorrectArityException("Function '${node.spelling}' should have arity $expected but has $arity")
        }
        if (sig.hasConst(node.spelling)) {
            throw IncorrectArityException("Identifier '${node.spelling}' is used both as a function and a constant")
        }

        node.arguments.forEach { it.accept(this) }
    }
}
