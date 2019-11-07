package kalkulierbar

class ClauseAcceptor: Calculus {
	override val identifier = "clause"
	
	/**
	 * Parses a set of clauses from text into an example state representation
	 * Note that the used format for both the formula and the state may differ for different implementations
	 * @param formula set of clauses of logical variables, format: a,b|!b,c|d,!e,!f where variables are [a-zA-Z]+
	 * @return serialized state representation of the input formula
	 */
	override fun parseFormula(formula: String): String {
		
		// Yes, I know, regex
		// The code could technically deal with weirder variable names, but let's keep things simple here
		// (!)?[a-zA-Z]+ matches a single variable that may be negated, let's abbreviate that with "v"
		// v(,v)* matches arbitrarily long lists of variables, e.g. a,b,!c,d. Let's call that "l"
		// l(\|l)* matches arbitrarily many lists, e.g. a,b|c,!d,|e
		// Easy, right?
		if(!(Regex("(!)?[a-zA-Z]+(,(!)?[a-zA-Z]+)*(\\|(!)?[a-zA-Z]+(,(!)?[a-zA-Z]+)*)*") matches formula))
			throw InvalidFormulaFormat("Invalid input formula format. Please adhere to the following format: a,b|!b,c|d,!e,!f with variables in [a-zA-Z]+")
		
		var parsed: MutableSet<Set<Pair<String, Boolean>>> = HashSet()
		val clauses = formula.split("|")
		
		for(clause in clauses) {
			val members = clause.split(",")
			val parsedClause: MutableSet<Pair<String, Boolean>> = HashSet()
			
			for(member in members) {
				// Check if the member variable is negated and set a boolean flag accordingly
				// true -> positive variable / false -> negated variable
				if(member[0] == '!')
					parsedClause.add(Pair(member.substring(1), false))
				else
					parsedClause.add(Pair(member, true))
			}
			
			parsed.add(parsedClause)
		}
		
		// Just return default serialization for now
		return parsed.toString()
	}
	
	/**
	 * ClauseAcceptor does not implement an actual calculus, so applyMove will always return an unchanged state
	 * @param state state representation
	 * @param move move representation, has no effect
	 * @return unchanged state representation 
	 */
	override fun applyMove(state: String, move: String): String {
		return state
	}
	
	/**
	 * ClauseAcceptor does not implement an actual calculus, so checkClose will always return true
	 * @param state state representation, has no effect
	 * @return true 
	 */
	override fun checkClose(state: String): Boolean {
		return true
	}
	
	/**
	 * Provides some API documentation regarding formats used for inputs and outputs, implementation specific
	 * @return plaintext API documentation
	 */
	override fun getDocumentation(): String {
		val doc = "Simple test calculus that accepts sets of clauses\n" +
				"move and close endpoints are non-functional, parse endpoint takes a set of clauses (format: a,b|!a,c|d for (a v b) ^ (!a v c) ^ (d)) and returns a state representation"
		return doc
	}
}