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
 * User-defined functions or constants beginning with 'sk' will be
 * renamed to 'usk' to avoid conflicts.
 *
 * Note: I'm unsure if this implementation produces correct results
 *       if it is not applied as part of the Skolem Normal Form transformation,
 *       especially if only a subformula is being skolemized
 */
class Skolemization : DoNothingVisitor() {

    companion object Companion {
        /**
         * Skolemize a formula
         * @param forumula Formula to transform
         * @return Skolemized formula
         */
        fun transform(formula: LogicNode): LogicNode {
            val instance = Skolemization()
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

        if (quantifierScope.size > quantifierScope.distinctBy { it.varName }.size)
            throw FormulaConversionException("Double-bound universally quantified variable encountered " +
                "during Skolemization")

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

        if (quantifierScope.size == 0)
            return Constant("sk$skolemCounter")

        val argList = mutableListOf<FirstOrderTerm>()

        quantifierScope.forEach {
            argList.add(QuantifiedVariable(it.varName))
        }

        return Function("sk$skolemCounter", argList)
    }
}

/**
 * Replaces QuantifiedVariables with their respective Skolem terms
 * User-defined constants or functions starting with 'sk' will be renamed
 * to start in 'usk' to ensure that Skolem terms are fresh
 * @param replacementMap Map of variable instances to replace alongside their Skolem term
 * @param bindingQuantifiers List of quantifiers in effect for the term in question
 */
class SkolemTermReplacer(
    val replacementMap: Map<QuantifiedVariable, FirstOrderTerm>,
    val bindingQuantifiers: List<UniversalQuantifier>
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

    /**
     * Re-name constants starting in 'sk' to avoid conflicts
     * @param node Constant encountered
     * @return Disambiguated constant
     */
    override fun visit(node: Constant): FirstOrderTerm {
        if (node.spelling.length < 2 || node.spelling.substring(0, 2) != "sk")
            return node

        return Constant("u${node.spelling}")
    }

    /**
     * Re-name functions starting in 'sk' to avoid conflicts
     * @param node Function encountered
     * @return Disambiguated function
     */
    override fun visit(node: Function): FirstOrderTerm {
        node.arguments = node.arguments.map { it.accept(this) }

        if (node.spelling.length < 2 || node.spelling.substring(0, 2) != "sk")
            return node

        return Function("u${node.spelling}", node.arguments)
    }
}
