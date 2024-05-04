package kalkulierbar.logic.transform

import kalkulierbar.FormulaConversionException
import kalkulierbar.logic.Constant
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.Function
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier

/**
 * Visitor-based variable renaming transformation
 * Ensures that every quantified variable is bound exactly once
 * A double-bound variable X will be renamed 'X', 'Xv1', 'Xv2' etc
 */
class UniqueVariables : DoNothingVisitor() {

    companion object Companion {

        /**
         * Re-name variables in a given formula to make them uniquely bound
         * @param formula Formula to transform
         * @return Equivalent formula with possibly different variable names
         */
        fun transform(formula: LogicNode): LogicNode {
            val instance = UniqueVariables()
            return formula.accept(instance)
        }
    }

    // Keep track of variable version numbers already used
    private val variableDisambCounter = mutableMapOf<String, Int>()

    // Keep track of variable names encountered to prevent possible double-binding
    private val seenVarNames = mutableListOf<String>()

    // Map of all QuantifiedVariables to be renamed
    private val replacementMap = mutableMapOf<QuantifiedVariable, String>()

    /**
     * Generate a unambiguous new name for a given variable name
     * @param varName
     * @return new, unique variable name
     */
    private fun handleVarBinding(varName: String): String {
        var newName = varName

        // Why is this loop necessary?
        // Good question! We can't assume that the generated name with the current version number
        // does not already exist in the formula (e.g. \all X: \all X: P(X) & \ex Xv1: P(Xv1))
        while (seenVarNames.contains(newName)) {
            variableDisambCounter[varName] = (variableDisambCounter[varName] ?: 0) + 1
            newName = "${varName}v${variableDisambCounter[varName]}"
        }

        seenVarNames.add(newName)

        return newName
    }

    /**
     * Apply gathered variable renamings on FO Terms
     * @param node Relation encountered
     * @return node The Relation with re-named variables
     */
    override fun visit(node: Relation): LogicNode {
        val renamer = VariableRenamer(replacementMap)
        node.arguments.forEach {
            it.accept(renamer)
        }
        return node
    }

    /**
     * Ensure that universally bound variable has a unique name
     * @param node UniversalQuantifier encountered
     * @return subformula with unique variable names
     */
    override fun visit(node: UniversalQuantifier): LogicNode {
        val disambName = handleVarBinding(node.varName)
        node.varName = disambName

        node.boundVariables.forEach {
            replacementMap[it] = disambName
        }

        node.child = node.child.accept(this)

        return node
    }

    /**
     * Ensure that existentially bound variable has a unique name
     * @param node ExistentialQuantifier encountered
     * @return subformula with unique variable names
     */
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

/**
 * FirstOrderTerm visitor to re-name variables
 * @param replacementMap Map of all variables to replace and their new variable name
 * @param strict Set to false in order to allow variables with no associated replacement
 */
class VariableRenamer(
    private val replacementMap: Map<QuantifiedVariable, String>,
    val strict: Boolean = true,
) : FirstOrderTermVisitor<Unit>() {
    /**
     * Change the variable name to the new spelling
     * Throw an exception if no new variable name is specified for the encountered variable
     * @param node: QuantifiedVariable encountered
     */
    override fun visit(node: QuantifiedVariable) {
        if (replacementMap[node] != null) {
            node.spelling = replacementMap[node]!!
        } else if (strict) {
            throw FormulaConversionException("Encountered QuantifiedVariable with no disambiguation replacement: $node")
        }
    }

    @Suppress("EmptyFunctionBlock")
    override fun visit(node: Constant) {}

    /**
     * Recursively replace variables in function terms
     * @param node Function invocation encountered
     */
    override fun visit(node: Function) {
        node.arguments.forEach {
            it.accept(this)
        }
    }
}
