package kalkulierbar.logic.transform

import kalkulierbar.FormulaConversionException
import kalkulierbar.logic.Constant
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.Function
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier

class UniqueVariables : DoNothingVisitor() {

    companion object Companion {
        fun transform(formula: LogicNode): LogicNode {
            val instance = UniqueVariables()
            return formula.accept(instance)
        }
    }

    private val variableDisambCounter = mutableMapOf<String, Int>()
    private val seenVarNames = mutableListOf<String>()
    private val replacementMap = mutableMapOf<QuantifiedVariable, String>()

    private fun handleVarBinding(varName: String): String {
        var newName = varName

        while (seenVarNames.contains(newName)) {
            variableDisambCounter[varName] = (variableDisambCounter[varName] ?: 0) + 1
            newName = "${varName}v${variableDisambCounter[varName]}"
        }

        seenVarNames.add(newName)

        return newName
    }

    override fun visit(node: Relation): LogicNode {
        val renamer = VariableRenamer(replacementMap)
        node.arguments.forEach {
            it.accept(renamer)
        }
        return node
    }

    override fun visit(node: UniversalQuantifier): LogicNode {
        val disambName = handleVarBinding(node.varName)
        node.varName = disambName

        node.boundVariables.forEach {
            replacementMap[it] = disambName
        }

        node.child = node.child.accept(this)

        return node
    }

    override fun visit(node: ExistentialQuantifier): LogicNode {
        val disambName = handleVarBinding(node.varName)
        node.varName = disambName

        node.boundVariables.forEach {
            replacementMap[it] = disambName
        }

        node.child = node.child.accept(this)

        return node
    }
}

class VariableRenamer(val replacementMap: Map<QuantifiedVariable, String>) : FirstOrderTermVisitor<Unit>() {
    override fun visit(node: QuantifiedVariable) {
        if (replacementMap[node] != null)
            node.spelling = replacementMap[node]!!
        else
            throw FormulaConversionException("Encountered QuantifiedVariable with no disambiguation replacement: $node")
    }

    @Suppress("EmptyFunctionBlock")
    override fun visit(node: Constant) {}

    override fun visit(node: Function) {
        node.arguments.forEach {
            it.accept(this)
        }
    }
}
