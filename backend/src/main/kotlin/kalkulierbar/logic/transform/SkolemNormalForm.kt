package kalkulierbar.logic.transform

import kalkulierbar.logic.LogicNode

class SkolemNormalForm {
    companion object Companion {
        fun transform(formula: LogicNode): LogicNode {
            val nnf = NegationNormalForm.transform(formula)
            val uniq = UniqueVariables.transform(nnf)
            val skol = Skolemization.transform(uniq)
            val prnx = PrenexNormalForm.transform(skol)
            return prnx
        }
    }
}
