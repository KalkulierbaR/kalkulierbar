package kalkulierbar.logic.transform

import kalkulierbar.logic.Constant
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.Function
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Relation

/**
 * Class to apply skolemization for Delta Move of non-clausal-tableaux
 * @param replacementMap maps free-variables to skolem-term
 */
class DeltaSkolemization(val replacementMap: Map<QuantifiedVariable, FirstOrderTerm>) : DoNothingVisitor() {

    companion object Companion {
        /**
         * Remove existential quantor at top from a formula and replace bound variables to quantor with skolem term
         * @param formula Formula with existential-quantor at top to transform
         * @return Formula containing skolem replacements of existential quantor
         */
        fun transform(formula: ExistentialQuantifier): LogicNode {
            // Collect all identifiers already in use and add to blacklist
            val blacklist = IdentifierCollector.collect(formula)
            // Collect free variables in formula
            val freeVariables = FreeVariableCollector.collect(formula)
            // get skolem-term with free variables paying attention to blacklist
            val term = getSkolemTerm(blacklist, freeVariables)
            // Create replacement map
            var replacementMap = mutableMapOf<QuantifiedVariable, FirstOrderTerm>()
            formula.boundVariables.forEach {
                replacementMap[it] = term
            }
            val instance = DeltaSkolemization(replacementMap)

            // Apply instantiation of bound variables with skolem term
            // + removes existential quantor
            return formula.child.accept(instance)
        }

        /**
         * Get a fresh skolem term for certain free variables
         * @param nameBlacklist set containing already used identifiers
         * @param freeVariables set of free variables to build skolem term with
         * @return Skolem term
         */
        private fun getSkolemTerm(nameBlacklist: Set<String>, freeVariables: Set<QuantifiedVariable>): FirstOrderTerm {
            var skolemCounter = 1
            var skolemName = "sk$skolemCounter"

            // Ensure freshness
            while (nameBlacklist.contains(skolemName)) {
                skolemCounter += 1
                skolemName = "sk$skolemCounter"
            }

            // Constant iff no free vars
            if (freeVariables.size == 0)
                return Constant(skolemName)

            // Create skolem term with free variables
            val argList = mutableListOf<FirstOrderTerm>()
            freeVariables.forEach {
                argList.add(QuantifiedVariable(it.spelling))
            }

            return Function(skolemName, argList)
        }
    }

    /**
     * Replace variables in FO Terms with the appropriate Skolem terms
     * @param node Relation node encountered
     * @return Relation with substituted variables
     */
    override fun visit(node: Relation): LogicNode {
        val replacer = DeltaSkolemTermReplacer(replacementMap)
        node.arguments = node.arguments.map { it.accept(replacer) }

        return node
    }
}

/**
 * Replaces QuantifiedVariables with their respective Skolem terms
 * @param replacementMap Map of variable instances to replace alongside their Skolem term
 */
class DeltaSkolemTermReplacer(
    val replacementMap: Map<QuantifiedVariable, FirstOrderTerm>
) : FirstOrderTermVisitor<FirstOrderTerm>() {

    /**
     * Instantiate variables with their Skolem terms as necessary
     * @param node QuantifiedVariable encountered
     * @return Skolem term of the variable if given, unchanged variable otherwise
     */
    override fun visit(node: QuantifiedVariable): FirstOrderTerm {
        if (replacementMap[node] != null) {
            // Clone the term to avoid object-sharing related weirdness
            return replacementMap[node]!!.clone()
        }
        return node
    }

    override fun visit(node: Constant) = node

    override fun visit(node: Function): FirstOrderTerm {
        node.arguments = node.arguments.map { it.accept(this) }
        return node
    }
}
