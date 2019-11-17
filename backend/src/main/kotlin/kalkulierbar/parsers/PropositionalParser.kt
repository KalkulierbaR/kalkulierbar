package kalkulierbar.parsers

import kalkulierbar.logic.PropositionalLogicNode
import kalkulierbar.logic.Or
import kalkulierbar.logic.Not
import kalkulierbar.logic.And
import kalkulierbar.logic.Var

class PropositionalParser(formula: String) {
	
	private val tokens = tokenize(formula)
	
	fun parse() = parseOr()
	
	private fun parseOr(): PropositionalLogicNode {
		val leftOp = parseAnd()
		
		if(nextTokenIs("|")){
			consume()
			val rightOp = parseAnd()
			return Or(leftOp, rightOp)
		}
		else {
			return leftOp
		}
	}
	
	private fun parseAnd(): PropositionalLogicNode {
		val leftOp = parseNot()
		
		if(nextTokenIs("&")) {
			consume()
			val rightOp = parseNot()
			return And(leftOp, rightOp)
		}
		else {
			return leftOp
		}
	}
	
	private fun parseNot(): PropositionalLogicNode {
		if(nextTokenIs("!")) {
			consume()
			return Not(parseParen())
		}
		else {
			return parseParen()
		}
	}
	
	private fun parseParen(): PropositionalLogicNode {
		if(nextTokenIs("(")) {
			consume()
			val exp = parseOr()
			consume(")")
			return exp
		}
		else {
			return parseVar()
		}
	}
	
	private fun parseVar(): PropositionalLogicNode {
		val exp = Var(tokens.first())
		consume()
		return exp
	}
	
	private fun nextTokenIs(expected: String): Boolean {
		if(tokens.size > 0)
			return expected == tokens.first()
		else
			return false
	}
	
	private fun consume() {
		tokens.removeAt(0)
	}
	
	private fun consume(expected: String) {
		if(tokens.first() == expected)
			consume()
		else
			throw Exception("Unexpected token: '${tokens.first()}', expected '$expected'")
	}

	companion object Companion {

		fun tokenize(formula: String): MutableList<String> {

			val oneCharToken = Regex("[\\(\\)!&\\|]")
			val whitespace = Regex("\\s")
			val permittedVarStartChars = Regex("[a-zA-Z]")
			val permittedVarChars = permittedVarStartChars

			val tokens = mutableListOf<String>()
			var i = 0

			println(formula.length)

			while (i < formula.length) {
				if (oneCharToken matches formula[i].toString()) {
					tokens.add(formula[i].toString())
					i += 1
				} else if (whitespace matches formula[i].toString()) {
					i += 1
				} else if (permittedVarStartChars matches formula[i].toString()) {
					var identifier = ""
					while (i < formula.length && permittedVarChars matches formula[i].toString()) {
						identifier += formula[i]
						i += 1
					}
					tokens.add(identifier)
				} else {
					throw Exception("Incorrect formula syntax at char $i")
				}
			}

			return tokens
		}
	}
}
