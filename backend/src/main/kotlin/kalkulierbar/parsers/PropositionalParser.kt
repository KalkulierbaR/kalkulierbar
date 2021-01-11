package kalkulierbar.parsers

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.EmptyFormulaException
import kalkulierbar.logic.And
import kalkulierbar.logic.Equiv
import kalkulierbar.logic.Impl
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Var

/**
 * Recursive descent parser for propositional logic
 * Supports basic operations (and, or, not) as well
 * as implications and equivalences.
 * For format specification, see docs/PropositionalFormula.md
 */
@Suppress("TooManyFunctions")
open class PropositionalParser {

    protected var tokens = mutableListOf<Token>()

    /**
     * Parses a propositional formula
     * @param formula input formula
     * @return LogicNode representing the formula
     */
    open fun parse(formula: String, positionInBaseString: Int = 0): LogicNode {
        tokens = Tokenizer.tokenize(formula, false, positionInBaseString)
        if (tokens.isEmpty()) {
            throw EmptyFormulaException("Expected a formula but got an empty String")
        }
        val res = parseEquiv()
        if (tokens.isNotEmpty())
            throw InvalidFormulaFormat("Expected end of formula but got ${gotMsg()}")

        return res
    }

    /**
     * Parses a series of 0 or more equivalences
     * @return LogicNode representing the series of equivalences
     */
    protected fun parseEquiv(): LogicNode {
        var stub = parseImpl()

        while (nextTokenIs(TokenType.EQUIVALENCE)) {
            consume()
            val rightOp = parseImpl()
            stub = Equiv(stub, rightOp)
        }

        return stub
    }

    /**
     * Parses a series of 0 or more implications
     * @return LogicNode representing the series of implications
     */
    protected fun parseImpl(): LogicNode {
        var stub = parseOr()

        while (nextTokenIs(TokenType.IMPLICATION)) {
            consume()
            val rightOp = parseOr()
            stub = Impl(stub, rightOp)
        }

        return stub
    }

    /**
     * Parses a series of 0 or more or-operations
     * @return LogicNode representing the series of or-operations
     */
    protected fun parseOr(): LogicNode {
        var stub = parseAnd()

        while (nextTokenIs(TokenType.OR)) {
            consume()
            val rightOp = parseAnd()
            stub = Or(stub, rightOp)
        }

        return stub
    }

    /**
     * Parses a series of 0 or more and-operations
     * @return LogicNode representing the series of and-operations
     */
    protected fun parseAnd(): LogicNode {
        var stub = parseNot()

        while (nextTokenIs(TokenType.AND)) {
            consume()
            val rightOp = parseNot()
            stub = And(stub, rightOp)
        }

        return stub
    }

    /**
     * Parses a unary not
     * @return LogicNode representing the negated formula
     */
    protected open fun parseNot(): LogicNode {
        if (nextTokenIs(TokenType.NOT)) {
            consume()
            return Not(parseParen())
        } else {
            return parseParen()
        }
    }

    /**
     * Parses a parenthesis in a formula
     * @return LogicNode representing the contents of the parenthesis
     */
    protected open fun parseParen(): LogicNode {
        if (nextTokenIs(TokenType.LPAREN)) {
            consume()
            val exp = parseEquiv()
            consume(TokenType.RPAREN)
            return exp
        } else {
            return parseVar()
        }
    }

    /**
     * Parses a variable in a formula
     * @return LogicNode representing the variable
     */
    protected fun parseVar(): LogicNode {
        if (!nextTokenIsIdentifier())
            throw InvalidFormulaFormat("Expected identifier but got ${gotMsg()}")

        val exp = Var(tokens.first().spelling)
        consume()
        return exp
    }

    /**
     * Check if the next token matches a given token type
     * @param expected expected token type
     * @return true iff the next token is of the expected type
     */
    protected fun nextTokenIs(expected: TokenType): Boolean {
        return tokens.size > 0 && tokens.first().type == expected
    }

    /**
     * Check if the next token is a variable
     * @return true iff the next token is a variable
     */
    protected fun nextTokenIsIdentifier(): Boolean {
        return nextTokenIs(TokenType.LOWERID) || nextTokenIs(TokenType.CAPID)
    }

    /**
     * Consume the next token from the token list
     */
    protected fun consume() {
        if (tokens.size == 0)
            throw InvalidFormulaFormat("Expected token but got end of input")
        tokens.removeAt(0)
    }

    /**
     * Consume the next token from the token list
     * If the token does not match the expected token, throw an exception
     * @param expected expected token
     */
    protected fun consume(expectedType: TokenType) {
        if (!nextTokenIs(expectedType))
            throw InvalidFormulaFormat("Expected '$expectedType' but got ${gotMsg()}")
        consume()
    }

    protected fun gotMsg(): String {
        if (tokens.size > 0)
            return "'${tokens.first()}' at position ${tokens.first().srcPosition}"
        return "end of input"
    }
}
