package kalkulierbar.parsers

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.PropositionalLogicNode

class FlexibleClauseSetParser {

    companion object Companion {

        /**
         * Parses a clause set or a propositional formula into a ClauseSet
         * For format specifications, see ClauseSetParser and PropositionalParser
         * @param formula formula or clause set to parse
         * @return ClauseSet representing the input formula
         */
        fun parse(formula: String, strategy: CnfStrategy = CnfStrategy.OPTIMAL): ClauseSet {

            // Detect a ClauseSet input from the presence of ; or ,
            // which are forbidden in propositional formulae
            // The only possible misclassification (a single atom) is also an equivalent propositional formula
            if (Regex(".*(;|,).*") matches formula) {
                try {
                    return ClauseSetParser.parse(formula)
                } catch (e: InvalidFormulaFormat) {
                    throw InvalidFormulaFormat("Parsing as clause set failed: ${e.message ?: "unknown error"}")
                }
            } else {
                try {
                    return convertToCNF(PropositionalParser(formula).parse(), strategy)
                } catch (e: InvalidFormulaFormat) {
                    throw InvalidFormulaFormat("Parsing as propositional formula failed: ${e.message ?: "unknown error"}")
                }
            }
        }

        fun convertToCNF(formula: PropositionalLogicNode, strategy: CnfStrategy): ClauseSet {
            val res: ClauseSet

            when (strategy) {
                CnfStrategy.NAIVE -> res = formula.naiveCNF()
                CnfStrategy.TSEYTIN -> res = formula.tseytinCNF()
                CnfStrategy.OPTIMAL -> {
                    val naive = formula.naiveCNF()
                    val tseytin = formula.tseytinCNF()
                    if (naive.clauses.size > tseytin.clauses.size)
                        res = tseytin
                    else
                        res = naive
                }
            }

            return res
        }
    }
}

enum class CnfStrategy {
    NAIVE, TSEYTIN, OPTIMAL
}
