package kalkulierbar

class ClauseAcceptor: Calculus {
	override val identifier = "clause"
	
	override fun parseFormula(formula: String): String {
		var parsed: MutableSet<Set<Pair<String, Boolean>>> = HashSet()
		val clauses = formula.split("|")
		
		for(clause in clauses) {
			val members = clause.split(",")
			val parsedClause: MutableSet<Pair<String, Boolean>> = HashSet()
			
			for(member in members) {
				if(member[0] == '!')
					parsedClause.add(Pair(member.substring(1), false))
				else
					parsedClause.add(Pair(member, true))
			}
			
			parsed.add(parsedClause)
		}
		
		return parsed.toString()
	}
	
	override fun applyMove(stateJSON: String, move: String): String {
		return "{}"
	}
	
	override fun checkClose(stateJSON: String): Boolean {
		return true
	}
	
	override fun getDocumentation(): String {
		val doc = "Simple test calculus that accepts sets of clauses\n" +
				"move and close endpoints are non-functional, parse endpoint takes a set of clauses (format: a,b|!a,c|d for (a v b) ^ (!a v c) ^ (d)) and returns a state representation"
		return doc
	}
}