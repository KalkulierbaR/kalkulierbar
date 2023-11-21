package kalkulierbar.nonclausaltableaux

import kalkulierbar.logic.Constant
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.Function
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Relation
import kalkulierbar.logic.transform.DoNothingVisitor
import kalkulierbar.logic.transform.FirstOrderTermVisitor
import kalkulierbar.logic.transform.FreeVariableCollector

/**
 * Class to apply skolemization for Delta Move of non-clausal-tableaux
 */
class DeltaSkolemization(
    private val toReplace: List<QuantifiedVariable>,
    private val term: FirstOrderTerm
) : DoNothingVisitor() {

    companion object Companion {
        /**
         * Remove existential quantifier at top from a formula and replace bound
         * variables to quantifier with skolem term
         * @param formula Formula with existential-quantifier at top to transform
         * @return Formula containing skolem replacements of existential quantifier
         */
        fun transform(
            formula: ExistentialQuantifier,
            blacklist: MutableSet<String>,
            skolemCounter: Int
        ): LogicNode {
            // Collect free variables in formula
            val freeVariables = FreeVariableCollector.collect(formula)
            // get skolem-term with free variables paying attention to blacklist
            val term = getSkolemTerm(skolemCounter, blacklist, freeVariables)

            // Replace variables bound by top-level quantifier with skolem term
            val instance = DeltaSkolemization(formula.boundVariables, term)
            return formula.child.accept(instance) // Return formula without top-level quantifier
        }

        /**
         * Get a fresh skolem term for certain free variables
         * @param nameBlacklist set containing already used identifiers
         * @param freeVariables set of free variables to build skolem term with
         * @return Skolem term
         */
        private fun getSkolemTerm(
            skolemBaseCount: Int,
            nameBlacklist: MutableSet<String>,
            freeVariables: Set<QuantifiedVariable>
        ): FirstOrderTerm {
            var skolemCounter = skolemBaseCount
            var skolemName = "sk$skolemCounter"

            // Ensure freshness
            while (nameBlacklist.contains(skolemName)) {
                skolemCounter += 1
                skolemName = "sk$skolemCounter"
            }

            // add new identifier to identifier set
            nameBlacklist.add(skolemName)

            // Constant iff no free vars
            if (freeVariables.isEmpty()) {
                return Constant(skolemName)
            }
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
        val replacer = DeltaSkolemTermReplacer(toReplace, term)
        node.arguments = node.arguments.map { it.accept(replacer) }

        return node
    }
}

/**
 * Replaces QuantifiedVariables with their respective Skolem terms
 */
class DeltaSkolemTermReplacer(
    private val toReplace: List<QuantifiedVariable>,
    private val term: FirstOrderTerm
) : FirstOrderTermVisitor<FirstOrderTerm>() {

    /**
     * Instantiate variables with their Skolem terms as necessary
     * @param node QuantifiedVariable encountered
     * @return Skolem term of the variable if given, unchanged variable otherwise
     */
    override fun visit(node: QuantifiedVariable): FirstOrderTerm {
        if (toReplace.contains(node)) {
            // Clone the term to avoid object-sharing related weirdness
            return term.clone()
        }
        return node
    }

    override fun visit(node: Constant) = node

    override fun visit(node: Function): FirstOrderTerm {
        node.arguments = node.arguments.map { it.accept(this) }
        return node
    }
}
