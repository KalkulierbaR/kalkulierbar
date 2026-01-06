package kalkulierbar.parsers

import kalkulierbar.FormulaConversionException
import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.transform.NaiveCNF
import kalkulierbar.logic.transform.TseytinCNF

object FlexibleClauseSetParser {
    /**
     * Parses a clause set or a propositional formula into a ClauseSet
     * For format specifications, see ClauseSetParser and PropositionalParser
     * @param formula formula or clause set to parse
     * @return ClauseSet representing the input formula
     */
    @Suppress("ReturnCount", "EmptyCatchBlock", "ComplexMethod")
    fun parse(
        formula: String,
        strategy: CnfStrategy = CnfStrategy.OPTIMAL,
    ): ClauseSet<String> {
        var errorMsg: String

        val likelyFormula = (Regex(".*(&|\\||->|<=>).*", RegexOption.DOT_MATCHES_ALL) matches formula)
        val likelyClauseSet = (Regex(".*([;,]).*", RegexOption.DOT_MATCHES_ALL) matches formula)

        // Try parsing as Dimacs-Like
        try {
            return DimacsLikeParser.parse(formula)
        } catch (_: InvalidFormulaFormat) {
        } // We don't support this officially, so no custom error for invalid dimacs

        // Try parsing as ClauseSet
        try {
            return ClauseSetParser.parse(formula)
        } catch (e: InvalidFormulaFormat) {
            errorMsg = "Parsing as clause set failed: ${e.message ?: "unknown error"}"
        }

        // Try parsing as PropositionalFormula
        try {
            return convertToCNF(PropositionalParser().parse(formula), strategy)
        } catch (e: InvalidFormulaFormat) {
            // If the input formula is likely intended to be certain input type, only report that error
            if (likelyFormula && !likelyClauseSet) {
                errorMsg = ""
            }

            if (likelyFormula || !likelyClauseSet) {
                errorMsg += "\nParsing as propositional formula failed: ${e.message ?: "unknown error"}"
            }
            throw InvalidFormulaFormat(errorMsg)
        }
    }

    /**
     * Converts a propositional formula to a ClauseSet using a given conversion strategy
     * Available strategies are:
     *   NAIVE  : Conversion by conversion to negation normal form and expansion
     May result in exponential blowup, output formula is equivalent to input
     *   TSEYTIN: Tseytin conversion, introduces new variables, output size is linear in terms
     of input size, output formula is equivalent in terms of satisfiability
     *   OPTIMAL: Chooses among NAIVE or TSEYTIN based on which conversion results in the smaller
     formula
     * @param formula formula to convert
     * @param strategy conversion strategy to apply
     * @return ClauseSet representation of the input formula
     */
    private fun convertToCNF(
        formula: LogicNode,
        strategy: CnfStrategy,
    ): ClauseSet<String> {
        val res: ClauseSet<String>

        when (strategy) {
            CnfStrategy.NAIVE -> {
                res = NaiveCNF.transform(formula)
            }

            CnfStrategy.TSEYTIN -> {
                res = TseytinCNF.transform(formula)
            }

            CnfStrategy.OPTIMAL -> {
                val tseytin = TseytinCNF.transform(formula)
                // Naive transformation might fail for large a large formula
                // Fall back to tseytin if so
                res =
                    try {
                        val naive = NaiveCNF.transform(formula)
                        if (naive.clauses.size > tseytin.clauses.size) {
                            tseytin
                        } else {
                            naive
                        }
                    } catch (e: FormulaConversionException) {
                        tseytin
                    }
            }
        }

        return res
    }
}

enum class CnfStrategy {
    NAIVE,
    TSEYTIN,
    OPTIMAL,
}
