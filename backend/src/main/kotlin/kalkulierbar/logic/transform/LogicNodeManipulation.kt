package kalkulierbar.logic.transform

import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Relation

/**
 * class to instantiate variables in a logic-node formula
 * @param replacementMap Map of variable instantiations to perform
 */
class LogicNodeVariableInstantiator(val replacementMap: Map<String, FirstOrderTerm>) : DoNothingVisitor() {

    companion object {
        /**
         * Instantiate the variables given in the map with their respective FO Term replacements
         * NOTE: This will break variable quantifier linking
         * @param term FO term to apply instantiations on
         * @param map Map of variable instantiations to perform
         * @return Term with instantiations applied
         */
        fun transform(formula: LogicNode, map: Map<String, FirstOrderTerm>): LogicNode {
            val instance = LogicNodeVariableInstantiator(map)
            return formula.accept(instance)
        }
    }

    override fun visit(node: Relation): LogicNode {
        val variableInstantiator = VariableInstantiator(replacementMap)
        node.arguments = node.arguments.map{ it.accept(variableInstantiator) }

        return node
    }
}

/**
 * LogicNode visitor to re-name Quantified Variables in formula
 * @param replacementMap Map of all variables to replace and their new Variable name
 */
class SelectiveSuffixAppender(val replacementMap: Map<QuantifiedVariable, String>) : DoNothingVisitor() {

    companion object Companion {

        /**
         * Re-name variables in a given formula
         * @param formula Formula to transform
         * @param vars: quantified variables to be renamed
         * @param suffix: suffix to be added to selected quantified variables
         * @return Equivalent formula with possibly different variable names
         */
        fun transform(formula: LogicNode, vars: List<QuantifiedVariable>, suffix: String): LogicNode {
            val map = vars.associateWith { it.spelling + suffix }
            val instance = SelectiveSuffixAppender(map)
            return formula.accept(instance)
        }
    }

    private val varRenamer = VariableRenamer(replacementMap, strict = false)

    /**
     * Recursively rename quantified variables
     * @param node: Relation of which child-terms should be renamed
     */
    override fun visit(node: Relation): LogicNode {
        node.arguments.forEach {
            it.accept(varRenamer)
        }
        return node
    }
}
