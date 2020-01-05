package kalkulierbar.parsers

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.And
import kalkulierbar.logic.Constant
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.Function
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier

/**
 * Recursive descent parser for propositional logic
 * Supports basic operations (and, or, not) as well
 * as implications and equivalences.
 * For format specification, see docs/PropositionalFormula.md
 */
@Suppress("TooManyFunctions")
class FirstOrderParser : PropositionalParser() {

    private val quantifierScope = mutableListOf<MutableList<QuantifiedVariable>>()

    /**
     * Parses a series of 0 or more and-operations
     * @return LogicNode representing the series of and-operations
     */
    protected override fun parseAnd(): LogicNode {
        var stub = parseQuantifier()

        while (nextTokenIs(TokenType.AND)) {
            consume()
            val rightOp = parseQuantifier()
            stub = And(stub, rightOp)
        }

        return stub
    }

    private fun parseQuantifier(): LogicNode {

        if (!nextTokenIs(TokenType.UNIVERSALQUANT) && !nextTokenIs(TokenType.EXISTENTIALQUANT))
            return parseNot()

        val quantType = tokens.first().type
        consume()

        if (!nextTokenIs(TokenType.CAPID))
            throw InvalidFormulaFormat("Expected quantified variable but got ${gotMsg()}")

        val varName = tokens.first().spelling
        consume()
        consume(TokenType.COLON)

        // Open a new scope for this quantifier
        // All QuantifiedVariables encountered in the subexpression will be added there
        quantifierScope.add(mutableListOf<QuantifiedVariable>())

        val subexpression = parseQuantifier()

        // Bound variables are variables with the spelling specified in the quantifier
        // Variables encountered with other spellings may be bound by surrounding quantifiers
        val boundVariables = quantifierScope.last().filter { it.spelling == varName }
        val boundBefore = quantifierScope.last().filter { it.spelling != varName }
        quantifierScope.removeAt(quantifierScope.size - 1) // Close the scope

        // If not yet bound variables remain in our scope, add them to the next higher scope
        // If no scope exists, the variables are unbound and the formula is incorrect
        if (quantifierScope.size == 0 && boundBefore.size > 0)
            throw InvalidFormulaFormat("Unbound Variables found: ${boundBefore.joinToString(", ")}")
        else if (boundBefore.size > 0)
            quantifierScope.last().addAll(boundBefore)

        val res: LogicNode

        if (quantType == TokenType.UNIVERSALQUANT)
            res = UniversalQuantifier(varName, subexpression, boundVariables)
        else
            res = ExistentialQuantifier(varName, subexpression, boundVariables)

        return res
    }

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
        if (!nextTokenIs(TokenType.CAPID))
            throw InvalidFormulaFormat("Expected relation identifier but got ${gotMsg()}")

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
        if (!nextTokenIsIdentifier())
            throw InvalidFormulaFormat("Expected identifier but got ${gotMsg()}")

        val res: FirstOrderTerm
        // Next token is quantified variable
        if (nextTokenIs(TokenType.CAPID)) {
            res = QuantifiedVariable(tokens.first().spelling)
            // Add variable to list of bound variables so the binding quantifier is informed of its existence
            if (quantifierScope.size == 0)
                throw InvalidFormulaFormat("Unbound variable ${gotMsg()}")
            quantifierScope.last().add(res)
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
