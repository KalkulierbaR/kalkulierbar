package kalkulierbar.parsers

import kalkulierbar.clause.ClauseSet

object DimacsLikeParser {

    /**
     * Parses a set of clauses from text into a ClauseSet using dimacs-like separators
     * @param formula set of clauses of logical variables, format: a b 0 -b c 0 d -e -f where variables are [a-zA-Z0-9]+
     * @return ClauseSet representing the input formula
     */
    fun parse(formula: String): ClauseSet<String> {
        // Preprocessing: Replace whitespace with break markers, remove linebreaks, replace clause end markers
        val pf = formula.replace("\n", "").replace(Regex("( )?\\b0\\b( )?"), ";").replace(Regex("\\s+"), ",")
        return ClauseSetParser.parseGeneric(pf, ";", ",", '-')
    }
}
