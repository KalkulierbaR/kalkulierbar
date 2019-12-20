package kalkulierbar.parsers

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.clause.ClauseSet

class FlexibleClauseSetParser {

    companion object Companion {

        /**
         * Parses a clause set or a propositional formula into a ClauseSet
         * For format specifications, see ClauseSetParser and PropositionalParser
         * @param formula formula or clause set to parse
         * @return ClauseSet representing the input formula
         */
        fun parse(formula: String): ClauseSet {

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
                    return PropositionalParser(formula).parse().naiveCNF()
                } catch (e: InvalidFormulaFormat) {
                    throw InvalidFormulaFormat("Parsing as propositional formula failed: ${e.message ?: "unknown error"}")
                }
            }
        }
    }
}
