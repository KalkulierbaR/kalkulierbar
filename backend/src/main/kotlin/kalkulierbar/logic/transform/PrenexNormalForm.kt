package kalkulierbar.logic.transform

import kalkulierbar.FormulaConversionException
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.UniversalQuantifier

/**
 * Visitor-based transformation for FO-formulae into Prenex Normal Form
 *
 * A formula in prenex normal form consists of a string of quantifiers followed
 * by a quantor-free formula
 * For more information, see https://en.wikipedia.org/wiki/Prenex_normal_form
 *
 * Requires each quantified variable to be bound exactly once
 * An exception will be thrown if this requirement is not met
 */
class PrenexNormalForm : DoNothingVisitor() {

    companion object Companion {

        /**
         * Apply the PNF transformation to a formula
         * @param formula Formula to transform
         * @return Equivalent formula in PNF
         */
        fun transform(formula: LogicNode): LogicNode {
            val instance = PrenexNormalForm()
            var res = formula.accept(instance)

            // re-create quantifier prefix from saved data
            instance.quantifiers.asReversed().forEach {
                val (varName, isUniversal, boundVars) = it
                if (isUniversal)
                    res = UniversalQuantifier(varName, res, boundVars)
                else
                    res = ExistentialQuantifier(varName, res, boundVars)
            }

            return res
        }
    }

    private var quantifiers: MutableList<Triple<String, Boolean, MutableSet<QuantifiedVariable>>> = mutableListOf()
    private var encounteredVars: MutableList<String> = mutableListOf()

    /**
     * Add encountered universal quantifiers to the list of quantifiers
     * and removes it from the formula
     * @param node UniversalQuantifier encountered
     * @return quantified sub-formula
     */
    override fun visit(node: UniversalQuantifier): LogicNode {

        if (encounteredVars.contains(node.varName))
            throw FormulaConversionException("Prenex Normal Form conversion encountered " +
                "double-binding of variable '${node.varName}'")

        quantifiers.add(Triple(node.varName, true, node.boundVariables))
        encounteredVars.add(node.varName)

        return node.child.accept(this)
    }

    /**
     * Add encountered existential quantifiers to the list of quantifiers
     * and removes it from the formula
     * @param node ExistentialQuantifier encountered
     * @return quantified sub-formula
     */
    override fun visit(node: ExistentialQuantifier): LogicNode {

        if (encounteredVars.contains(node.varName))
            throw FormulaConversionException("Prenex Normal Form conversion encountered " +
                " double-binding of variable '${node.varName}'")

        quantifiers.add(Triple(node.varName, false, node.boundVariables))
        encounteredVars.add(node.varName)

        return node.child.accept(this)
    }
}
