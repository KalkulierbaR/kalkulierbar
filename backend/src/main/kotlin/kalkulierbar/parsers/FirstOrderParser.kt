package kalkulierbar.parsers

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.Constant
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.Function
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Relation

/**
 * Recursive descent parser for propositional logic
 * Supports basic operations (and, or, not) as well
 * as implications and equivalences.
 * For format specification, see docs/PropositionalFormula.md
 */
@Suppress("TooManyFunctions")
class FirstOrderParser : PropositionalParser() {

    /**
     * Parses a parenthesis in a formula
     * @return LogicNode representing the contents of the parenthesis
     */
    protected override fun parseParen(): LogicNode {
        if (nextTokenIs(TokenType.LPAREN)) {
            consume()
            val exp = parseEquiv()
            consume(TokenType.RPAREN)
            return exp
        } else {
            return parseAtomic()
        }
    }

    private fun parseAtomic(): LogicNode {
        if (!nextTokenIs(TokenType.CAPID)) {
            val got = if (tokens.size > 0) tokens.first().toString() else "end of input"
            throw InvalidFormulaFormat("Expected relation identifier but got $got")
        }

        val relationIdentifier = tokens.first().spelling
        consume()
        consume(TokenType.LPAREN)

        val arguments = mutableListOf(parseTerm())
        while (nextTokenIs(TokenType.COMMA)) {
            consume()
            arguments.add(parseTerm())
        }

        consume(TokenType.RPAREN)

        return Relation(relationIdentifier, arguments)
    }

    private fun parseTerm(): FirstOrderTerm {
        if (tokens.size == 0)
            throw InvalidFormulaFormat("Expected identifier but got end of input")

        if (!nextTokenIsIdentifier()) {
            val context = tokens.joinToString(" ")
            val got = tokens.first()
            throw InvalidFormulaFormat("Expected identifier but got '$got' at '$context'")
        }

        val res: FirstOrderTerm
        // Next token is quantified variable
        if (nextTokenIs(TokenType.CAPID)) {
            res = QuantifiedVariable(tokens.first().spelling)
            consume()
        } else {
            val identifier = tokens.first().spelling
            consume()
            if (nextTokenIs(TokenType.LPAREN)) {
                consume()
                val arguments = mutableListOf(parseTerm())
                while (nextTokenIs(TokenType.COMMA)) {
                    consume()
                    arguments.add(parseTerm())
                }
                consume(TokenType.RPAREN)
                res = Function(identifier, arguments)
            } else {
                res = Constant(identifier)
            }
        }

        return res
    }
}
