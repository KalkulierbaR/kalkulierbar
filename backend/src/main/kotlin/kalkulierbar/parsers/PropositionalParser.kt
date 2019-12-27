package kalkulierbar.parsers

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.And
import kalkulierbar.logic.Equiv
import kalkulierbar.logic.Impl
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.PropositionalLogicNode
import kalkulierbar.logic.Var

/**
 * Recursive descent parser for propositional logic
 * Supports basic operations (and, or, not) as well
 * as implications and equivalences.
 * For format specification, see docs/PropositionalFormula.md
 */
@Suppress("TooManyFunctions")
class PropositionalParser {

    private var tokens = mutableListOf<String>()

    /**
     * Parses a propositional formula
     * @param formula input formula
     * @return PropositionalLogicNode representing the formula
     */
    fun parse(formula: String): PropositionalLogicNode {
        tokens = tokenize(formula)
        return parseEquiv()
    }

    /**
     * Parses a series of 0 or more equivalences
     * @return PropositionalLogicNode representing the series of equivalences
     */
    private fun parseEquiv(): PropositionalLogicNode {
        var stub = parseImpl()

        while (nextTokenIs("<=>")) {
            consume()
            val rightOp = parseImpl()
            stub = Equiv(stub, rightOp)
        }

        return stub
    }

    /**
     * Parses a series of 0 or more implications
     * @return PropositionalLogicNode representing the series of implications
     */
    private fun parseImpl(): PropositionalLogicNode {
        var stub = parseOr()

        while (nextTokenIs("-->")) {
            consume()
            val rightOp = parseOr()
            stub = Impl(stub, rightOp)
        }

        return stub
    }

    /**
     * Parses a series of 0 or more or-operations
     * @return PropositionalLogicNode representing the series of or-operations
     */
    private fun parseOr(): PropositionalLogicNode {
        var stub = parseAnd()

        while (nextTokenIs("|")) {
            consume()
            val rightOp = parseAnd()
            stub = Or(stub, rightOp)
        }

        return stub
    }

    /**
     * Parses a series of 0 or more and-operations
     * @return PropositionalLogicNode representing the series of and-operations
     */
    private fun parseAnd(): PropositionalLogicNode {
        var stub = parseNot()

        while (nextTokenIs("&")) {
            consume()
            val rightOp = parseNot()
            stub = And(stub, rightOp)
        }

        return stub
    }

    /**
     * Parses a unary not
     * @return PropositionalLogicNode representing the negated formula
     */
    private fun parseNot(): PropositionalLogicNode {
        if (nextTokenIs("!")) {
            consume()
            return Not(parseParen())
        } else {
            return parseParen()
        }
    }

    /**
     * Parses a parenthesis in a formula
     * @return PropositionalLogicNode representing the contents of the parenthesis
     */
    private fun parseParen(): PropositionalLogicNode {
        if (nextTokenIs("(")) {
            consume()
            val exp = parseEquiv()
            consume(")")
            return exp
        } else {
            return parseVar()
        }
    }

    /**
     * Parses a variable in a formula
     * @return PropositionalLogicNode representing the variable
     */
    private fun parseVar(): PropositionalLogicNode {
        if (tokens.size == 0)
            throw InvalidFormulaFormat("Expected variable identifier but got end of input")

        if (!nextTokenIsVariable()) {
            val context = tokens.joinToString(" ")
            val got = tokens.first()
            throw InvalidFormulaFormat("Expected variable identifier but got reserved token '$got' at '$context'")
        }
        val exp = Var(tokens.first())
        consume()
        return exp
    }

    /**
     * Check if the next token matches a given token
     * @param expected expected token
     * @return true iff the next token is the expected token
     */
    private fun nextTokenIs(expected: String): Boolean {
        if (tokens.size > 0)
            return expected == tokens.first()
        else
            return false
    }

    /**
     * Check if the next token is a variable
     * @return true iff the next token is a variable
     */
    private fun nextTokenIsVariable(): Boolean {
        if (tokens.size > 0)
            // Every token that id not a reserved token has to be a variable
            return !reservedTokens.contains(tokens.first())
        else
            return false
    }

    /**
     * Consume the next token from the token list
     */
    private fun consume() {
        if (tokens.size == 0)
            throw InvalidFormulaFormat("Expected token but got end of input")
        tokens.removeAt(0)
    }

    /**
     * Consume the next token from the token list
     * If the token does not match the expected token, throw an exception
     * @param expected expected token
     */
    private fun consume(expected: String) {
        if (tokens.size == 0)
            throw InvalidFormulaFormat("Expected token '$expected' but got end of input")
        else if (tokens.first() == expected)
            consume()
        else {
            val got = tokens.first()
            val context = tokens.joinToString(" ")
            throw InvalidFormulaFormat("Unexpected token: '$got', expected '$expected' at '$context'")
        }
    }

    companion object Companion {

        // Tokens not permitted as variable names
        val reservedTokens = listOf("&", "|", "!", "(", ")", "-->", "<=>")

        // Single-character tokens can be handled in one step
        private val oneCharToken = Regex("[\\(\\)!&\\|]")
        private val whitespace = Regex("\\s")

        // Might be reasonable to treat the first character of a varname
        // differently from the rest of the variable in the future
        // Note that the current implementation implies/requires that
        // VarStartChars is a subset of VarChars
        private val permittedVarStartChars = Regex("[a-zA-Z0-9]")
        private val permittedVarChars = permittedVarStartChars

        /**
         * Splits a raw formula into its tokens, removes whitespace etc
         * @param formula Input formula to tokenize
         * @return list of extracted tokens
         */
        fun tokenize(formula: String): MutableList<String> {
            val tokens = mutableListOf<String>()
            var i = 0

            // Extract single token until end of input reached
            while (i < formula.length) {
                i = extractToken(formula, i, tokens)
            }

            return tokens
        }

        /**
         * Extract a single token from a given formula at a given offset
         * @param formula formula to extract token from
         * @param index start offset of the token to extract
         * @param tokens list of tokens to append the new token to
         * @return start offset of the next token
         */
        @Suppress("ComplexMethod", "MagicNumber")
        private fun extractToken(formula: String, index: Int, tokens: MutableList<String>): Int {
            var i = index
            val len = formula.length

            // If the next token is one char only, we can add it to the list directly
            if (oneCharToken matches formula[i].toString()) {
                tokens.add(formula[i].toString())
                i += 1
            } else if (i + 1 < len && formula.substring(i, i + 2) == "->") {
                tokens.add("-->")
                i += 2
            } else if (i + 2 < len && formula.substring(i, i + 3) == "<=>") {
                tokens.add("<=>")
                i += 3
            } else if (i + 2 < len && formula.substring(i, i + 3) == "<->") {
                tokens.add("<=>")
                i += 3
            } else if (whitespace matches formula[i].toString()) {
                i += 1 // Skip whitespace
            } else if (permittedVarStartChars matches formula[i].toString()) {
                var identifier = ""
                // Extract identifier
                while (i < formula.length && permittedVarChars matches formula[i].toString()) {
                    identifier += formula[i]
                    i += 1
                }
                tokens.add(identifier)
            } else {
                throw InvalidFormulaFormat("Incorrect formula syntax at char $i")
            }
            return i
        }
    }
}
