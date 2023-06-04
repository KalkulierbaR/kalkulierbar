package main.kotlin.kalkulierbar.logic.transform

import kalkulierbar.logic.*
import kalkulierbar.logic.Function
import kalkulierbar.logic.transform.DoNothingCollector
import kalkulierbar.logic.transform.FirstOrderTermVisitor

data class CompoundSignature(val name: String, val arity: Int)

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

    private val termSigExtr = TermSignatureExtractor(constants, functions)

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
) : FirstOrderTermVisitor<Unit>() {
    override fun visit(node: Constant) {
        constants.add(node.spelling)
    }

    override fun visit(node: Function) {
        functions.add(CompoundSignature(name = node.spelling, arity = node.arguments.size))
        node.arguments.forEach { it.accept(this) }
    }

    override fun visit(node: QuantifiedVariable) {}
}
