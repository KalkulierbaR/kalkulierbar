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

/**
 * Visitor-based Skolemization transformation
 * Replaces existential quantifiers with fresh Skolem terms
 *
 * Requires absence of variable-hiding in quantifier scopes, will
 * throw an exception otherwise.
 *
 * Introduced Skolem terms are of the form 'skN' where N is a number.
 *
 * Note: I'm unsure if this implementation produces correct results
 *       if it is not applied as part of the Skolem Normal Form transformation,
 *       especially if only a subformula is being skolemized
 * @param signature signature of the formula; used to avoid duplicate names skolem constants
 */
class Skolemization(private val signature: Signature) : DoNothingVisitor() {

    companion object Companion {
        /**
         * Skolemize a formula
         * @param formula Formula to transform
         * @return Skolemized formula
         */
        fun transform(formula: LogicNode): LogicNode {
            // Collect all identifiers already in use and add to blacklist
            val sig = Signature.of(formula)
            val instance = Skolemization(sig)
            return formula.accept(instance)
        }
    }

    private var quantifierScope: MutableList<UniversalQuantifier> = mutableListOf()
    private var replacementMap = mutableMapOf<QuantifiedVariable, FirstOrderTerm>()
    private var skolemCounter = 0

    /**
     * Skolemize a universally quantified subformula
     * @param node UniversalQuantifier encountered
     * @return Skolemized subformula
     */
    override fun visit(node: UniversalQuantifier): LogicNode {
        quantifierScope.add(node)
        node.child = node.child.accept(this)
        quantifierScope.removeAt(quantifierScope.size - 1)

        return node
    }

    /**
     * Remove existential quantifiers and add necessary variable replacements to the replacement map
     * @param node ExistentialQuantifier encountered
     * @return Skolemized subformula without the existential quantifier
     */
    override fun visit(node: ExistentialQuantifier): LogicNode {
        if (quantifierScope.size > quantifierScope.distinctBy { it.varName }.size) {
            throw FormulaConversionException(
                "Double-bound universally quantified variable encountered " +
                    "during Skolemization",
            )
        }

        val term = getSkolemTerm()

        node.boundVariables.forEach {
            replacementMap[it] = term
        }

        return node.child.accept(this)
    }

    /**
     * Replace variables in FO Terms with the appropriate Skolem terms
     * @param node Relation node encountered
     * @return Relation with substituted variables
     */
    override fun visit(node: Relation): LogicNode {
        val replacer = SkolemTermReplacer(replacementMap, quantifierScope)
        node.arguments = node.arguments.map { it.accept(replacer) }

        return node
    }

    /**
     * Get a fresh skolem term for the current quantifier scope
     * @return Skolem term
     */
    private fun getSkolemTerm(): FirstOrderTerm {
        skolemCounter += 1
        var skolemName = "sk$skolemCounter"

        // Ensure freshness
        while (signature.hasConstOrFunction(skolemName)) {
            skolemCounter += 1
            skolemName = "sk$skolemCounter"
        }

        if (quantifierScope.size == 0) {
            return Constant(skolemName)
        }

        val argList = mutableListOf<FirstOrderTerm>()

        quantifierScope.forEach {
            argList.add(QuantifiedVariable(it.varName))
        }

        return Function(skolemName, argList)
    }
}

/**
 * Replaces QuantifiedVariables with their respective Skolem terms
 * @param replacementMap Map of variable instances to replace alongside their Skolem term
 * @param bindingQuantifiers List of quantifiers in effect for the term in question
 */
class SkolemTermReplacer(
    private val replacementMap: Map<QuantifiedVariable, FirstOrderTerm>,
    private val bindingQuantifiers: List<UniversalQuantifier>,
) : FirstOrderTermVisitor<FirstOrderTerm>() {

    /**
     * Instantiate variables with their Skolem terms as necessary
     * @param node QuantifiedVariable encountered
     * @return Skolem term of the variable if given, unchanged variable otherwise
     */
    override fun visit(node: QuantifiedVariable): FirstOrderTerm {
        if (replacementMap[node] != null) {
            val linker = QuantifierLinker(bindingQuantifiers, true)

            // Clone the term to avoid object-sharing related weirdness
            val skolemTerm = replacementMap[node]!!.clone()

            // Register introduced variables with their binding quantifiers
            skolemTerm.accept(linker)

            return skolemTerm
        }

        return node
    }

    override fun visit(node: Constant) = node

    override fun visit(node: Function): FirstOrderTerm {
        node.arguments = node.arguments.map { it.accept(this) }
        return node
    }
}
