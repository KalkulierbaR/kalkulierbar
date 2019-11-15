package kalkulierbar

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonConfiguration
import main.kotlin.kalkulierbar.JSONSerializable
import main.kotlin.kalkulierbar.clause.ClauseSet
import main.kotlin.kalkulierbar.clause.Clause
import main.kotlin.kalkulierbar.clause.Atom

val json = Json(JsonConfiguration.Stable)

class ClauseAcceptor : Calculus<ClauseSet>() {
    override val identifier = "clause"

    /**
	 * Parses a set of clauses from text into an example state representation
	 * Note that the used format for both the formula and the state may differ for different implementations
	 * @param formula set of clauses of logical variables, format: a,b;!b,c;d,!e,!f where variables are [a-zA-Z]+
	 * @return serialized state representation of the input formula
	 */
    override fun parseFormula(formula: String): ClauseSet {

        // Yes, I know, regex
        // The code could technically deal with weirder variable names, but let's keep things simple here
        // (!)?[a-zA-Z]+ matches a single variable that may be negated, let's abbreviate that with "v"
        // v(,v)* matches arbitrarily long lists of variables, e.g. a,b,!c,d. Let's call that "l"
        // l(;l)* matches arbitrarily many lists, e.g. a,b;c,!d;e
        // Easy, right?
        if (!(Regex("(!)?[a-zA-Z]+(,(!)?[a-zA-Z]+)*(;(!)?[a-zA-Z]+(,(!)?[a-zA-Z]+)*)*") matches formula))
            throw InvalidFormulaFormat("Invalid input formula format. Please adhere to the following format: a,b;!b,c;d,!e,!f with variables in [a-zA-Z]+")

        val parsed = ClauseSet()
        val clauses = formula.split(";")

        for (clause in clauses) {
            val members = clause.split(",")
            val parsedClause = Clause()

            for (member in members) {
                // Check if the member variable is negated and set a boolean flag accordingly
                // true -> positive variable / false -> negated variable
                if (member[0] == '!')
                    parsedClause.add(Atom(member.substring(1), true))
                else
                    parsedClause.add(Atom(member))
            }

            parsed.add(parsedClause)
        }

        // Just return default serialization for now
        return parsed
    }

    /**
	 * ClauseAcceptor does not implement an actual calculus, so applyMove will always return an unchanged state
	 * @param state state representation
	 * @param move move representation, has no effect
	 * @return unchanged state representation
	 */
    override fun applyMove(state: ClauseSet, move: String): ClauseSet {
        return ClauseSet()
    }

    /**
	 * ClauseAcceptor does not implement an actual calculus, so checkClose will always return true
	 * @param state state representation, has no effect
	 * @return true
	 */
    override fun checkClose(state: ClauseSet): Boolean {
        return true
    }

    /**
	 * Provides some API documentation regarding formats used for inputs and outputs, implementation specific
	 * @return plaintext API documentation
	 */
    override fun getDocumentation(): String {
        val doc = "Simple test calculus that accepts sets of clauses\n" +
                "move and close endpoints are non-functional, parse endpoint takes a set of clauses" +
                "(format: a,b;!a,c;d for (a v b) ^ (!a v c) ^ (d)) and returns a state representation"
        return doc
    }

    override fun fromJSON(state: String): ClauseSet {
        return json.parse(ClauseSet.serializer(), state)
    }
}
