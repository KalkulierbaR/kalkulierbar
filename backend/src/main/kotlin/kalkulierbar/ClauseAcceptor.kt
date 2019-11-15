package kalkulierbar

import kalkulierbar.clause.ClauseSet
import kalkulierbar.parsers.ClauseSetParser
import kotlinx.serialization.json.Json

class ClauseAcceptor : JSONCalculus<ClauseSet>() {
    override val identifier = "clause"

    /**
     * Parses a set of clauses from text into an example state representation
     * @param formula set of clauses of logical variables, format: a,b;!b,c;d,!e,!f where variables are [a-zA-Z]+
     * @return ClauseSet state representation
     */
    override fun parseFormulaToState(formula: String) = ClauseSetParser.parse(formula)

    /**
     * ClauseAcceptor does not implement an actual calculus, so applyMoveOnState will always return an unchanged state
     * @param state current state
     * @param move move representation, has no effect
     * @return unchanged state
     */
    override fun applyMoveOnState(state: ClauseSet, move: String): ClauseSet {
        return state
    }

    /**
     * ClauseAcceptor does not implement an actual calculus, so checkCloseOnState will always return true
     * @param state current state, has no effect
     * @return true
     */
    override fun checkCloseOnState(state: ClauseSet): Boolean {
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

    @kotlinx.serialization.UnstableDefault
    override fun jsonToState(json: String): ClauseSet {
        return Json.plain.parse(ClauseSet.serializer(), json)
    }

    @kotlinx.serialization.UnstableDefault
    override fun stateToJson(state: ClauseSet): String {
        return Json.plain.stringify(ClauseSet.serializer(), state)
    }
}
