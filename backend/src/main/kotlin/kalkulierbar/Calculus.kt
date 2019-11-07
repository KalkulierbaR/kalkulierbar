package kalkulierbar

interface Calculus {
	val identifier: String
	
	fun parseFormula(formula: String): String
	
	fun applyMove(stateJSON: String, move: String): String
	
	fun checkClose(stateJSON: String): Boolean
	
	fun getDocumentation(): String {
		return "[no documentation available for this calculus]"
	}
}