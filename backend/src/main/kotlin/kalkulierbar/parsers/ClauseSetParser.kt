package kalkulierbar.parsers

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet

class ClauseSetParser() {

    companion object Companion {

        /**
	 * Parses a set of clauses from text into a ClauseSet using default clause and atom separators
	 * @param formula set of clauses of logical variables, format: a,b;!b,c;d,!e,!f where variables are [a-zA-Z]+
	 * @return ClauseSet representing the input formula
	 */
        fun parse(formula: String) = parseGeneric(formula, ";", ",")

        /**
	 * Parses a set of clauses from text into a ClauseSet with flexible separators
	 * @param formula set of clauses of logical variables in textual form
	 * @param clauseSeparator string separating clauses from each other, e.g. ";"
	 * @param atomSeparator string separating atoms (variables) from each other, e.g. ","
	 * @return ClauseSet representing the input formula
	 */
        fun parseGeneric(formula: String, clauseSeparator: String, atomSeparator: String): ClauseSet {
            // Yes, I know, regex
            // The code could technically deal with weirder variable names, but let's keep things simple here
            // This explanation uses the default separators "," and ";"
            // (!)?[a-zA-Z]+ matches a single variable that may be negated, let's abbreviate that with "v"
            // v(,v)* matches arbitrarily long lists of variables, e.g. a,b,!c,d. Let's call that "l"
            // l(;l)* matches arbitrarily many lists, e.g. a,b;c,!d;e
            // Easy, right?
            val aSep = Regex.escape(atomSeparator)
            val cSep = Regex.escape(clauseSeparator)
            val formulaFormat = "(!)?[a-zA-Z]+($aSep(!)?[a-zA-Z]+)*($cSep(!)?[a-zA-Z]+($aSep(!)?[a-zA-Z]+)*)*"
            val formatExample = "a${aSep}b$cSep!b${aSep}c${cSep}d$aSep!e$aSep!f"

            if (!(Regex(formulaFormat) matches formula))
                throw InvalidFormulaFormat("Invalid input formula format. Please adhere to the following format: $formatExample with variables in [a-zA-Z]+")

            val parsed = ClauseSet()
            val clauses = formula.split(clauseSeparator)

            for (clause in clauses) {
                val members = clause.split(atomSeparator)
                val parsedClause = Clause()

                for (member in members) {
                    // Check if the member variable is negated and set a boolean flag accordingly
                    // true -> positive variable / false -> negated variable
                    val atom: Atom

                    if (member[0] == '!')
                        atom = Atom(member.substring(1), true)
                    else
                        atom = Atom(member)

                    parsedClause.add(atom)
                }

                parsed.add(parsedClause)
            }

            return parsed
        }
    }
}
