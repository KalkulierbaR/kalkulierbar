package kalkulierbar.logic.transform

import kalkulierbar.FormulaConversionException
import kalkulierbar.logic.Constant
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.Function
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier

class Skolemization : DoNothingVisitor() {

    companion object Companion {
        fun transform(formula: LogicNode): LogicNode {
            val instance = Skolemization()
            return formula.accept(instance)
        }
    }

    private var quantifierScope: MutableList<UniversalQuantifier> = mutableListOf()
    private var replacementMap = mutableMapOf<QuantifiedVariable, FirstOrderTerm>()
    private var skolemCounter = 0

    override fun visit(node: UniversalQuantifier): LogicNode {

        quantifierScope.add(node)

        node.child = node.child.accept(this)

        quantifierScope.removeAt(quantifierScope.size - 1)

        return node
    }

    override fun visit(node: ExistentialQuantifier): LogicNode {

        if (quantifierScope.size > quantifierScope.distinctBy { it.varName }.size)
            throw FormulaConversionException("Double-bound universally quantified variable encountered " +
                "during Skolemization")

        val term = getSkolemTerm()

        node.boundVariables.forEach {
            replacementMap[it] = term
        }

        return node.child.accept(this)
    }

    override fun visit(node: Relation): LogicNode {
        val replacer = SkolemTermReplacer(replacementMap, quantifierScope)
        node.arguments = node.arguments.map { it.accept(replacer) }

        return node
    }

    private fun getSkolemTerm(): FirstOrderTerm {
        skolemCounter += 1

        if (quantifierScope.size == 0)
            return Constant("sk$skolemCounter")

        val argList = mutableListOf<FirstOrderTerm>()

        quantifierScope.forEach {
            argList.add(QuantifiedVariable(it.varName))
        }

        return Function("sk$skolemCounter", argList)
    }
}

class SkolemTermReplacer(
    val replacementMap: Map<QuantifiedVariable, FirstOrderTerm>,
    val bindingQuantifiers: List<UniversalQuantifier>
) : FirstOrderTermVisitor<FirstOrderTerm>() {

    override fun visit(node: QuantifiedVariable): FirstOrderTerm {
        if (replacementMap[node] != null) {
            val linker = SkolemQuantifierLinker(bindingQuantifiers)
            val skolemTerm = replacementMap[node]!!.clone()
            skolemTerm.accept(linker)
            return skolemTerm
        }

        return node
    }

    override fun visit(node: Constant): FirstOrderTerm {
        if (node.spelling.length < 2 || node.spelling.substring(0, 2) != "sk")
            return node

        return Constant("u${node.spelling}")
    }

    override fun visit(node: Function): FirstOrderTerm {
        node.arguments = node.arguments.map { it.accept(this) }

        if (node.spelling.length < 2 || node.spelling.substring(0, 2) != "sk")
            return node

        return Function("u${node.spelling}", node.arguments)
    }
}

class SkolemQuantifierLinker(val quantifiers: List<UniversalQuantifier>) : FirstOrderTermVisitor<Unit>() {
    override fun visit(node: QuantifiedVariable) {
        val matchingQuantifiers = quantifiers.filter { it.varName == node.spelling }

        if (matchingQuantifiers.size == 0)
            throw FormulaConversionException("Error linking variables to quantifiers: " +
                "Variable '${node.spelling}' is not bound by any universal quantifier")
        else if (matchingQuantifiers.size > 1)
            throw FormulaConversionException("Error linking variables to quantifiers: " +
                "Variable '${node.spelling}' is bound by more than one universal quantifier")

        matchingQuantifiers[0].boundVariables.add(node)
    }

    @Suppress("EmptyFunctionBlock")
    override fun visit(node: Constant) {}

    override fun visit(node: Function) {
        node.arguments.forEach { it.accept(this) }
    }
}
