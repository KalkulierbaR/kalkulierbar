package kalkulierbar.logic.transform

import kalkulierbar.logic.LogicNode

/**
 * Visitor-based transformation for FO-formulae into Skolem Normal Form
 *
 * A formula in Skolem normal form consists of a string of universal quantifiers
 * followed by a quantor-free formula
 * For more information, see https://en.wikipedia.org/wiki/Skolem_normal_form
 */
class SkolemNormalForm {
    companion object Companion {

        /**
         * Apply the SNF transformation to a formula
         * @param formula Formula to transform
         * @return Equivalent formula in SNF
         */
        fun transform(formula: LogicNode): LogicNode {
            val nnf = NegationNormalForm.transform(formula)
            val uniq = UniqueVariables.transform(nnf)
            val skol = Skolemization.transform(uniq)
            return PrenexNormalForm.transform(skol)
        }
    }
}
