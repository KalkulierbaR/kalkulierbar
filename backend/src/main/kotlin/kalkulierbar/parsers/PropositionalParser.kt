package kalkulierbar.parsers

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.And
import kalkulierbar.logic.Equiv
import kalkulierbar.logic.Impl
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.PropositionalLogicNode
import kalkulierbar.logic.Var

@Suppress("TooManyFunctions")
class PropositionalParser(formula: String) {

    private val tokens = tokenize(formula)

    fun parse() = parseEquiv()

    private fun parseEquiv(): PropositionalLogicNode {
        var stub = parseImpl()

        while (nextTokenIs("<=>")) {
            consume()
            val rightOp = parseImpl()
            stub = Equiv(stub, rightOp)
        }

        return stub
    }

    private fun parseImpl(): PropositionalLogicNode {
        var stub = parseOr()

        while (nextTokenIs("-->")) {
            consume()
            val rightOp = parseOr()
            stub = Impl(stub, rightOp)
        }

        return stub
    }

    private fun parseOr(): PropositionalLogicNode {
        var stub = parseAnd()

        while (nextTokenIs("|")) {
            consume()
            val rightOp = parseAnd()
            stub = Or(stub, rightOp)
        }

        return stub
    }

    private fun parseAnd(): PropositionalLogicNode {
        var stub = parseNot()

        while (nextTokenIs("&")) {
            consume()
            val rightOp = parseNot()
            stub = And(stub, rightOp)
        }

        return stub
    }

    private fun parseNot(): PropositionalLogicNode {
        if (nextTokenIs("!")) {
            consume()
            return Not(parseParen())
        } else {
            return parseParen()
        }
    }

    private fun parseParen(): PropositionalLogicNode {
        if (nextTokenIs("(")) {
            consume()
            val exp = parseOr()
            consume(")")
            return exp
        } else {
            return parseVar()
        }
    }

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

    private fun nextTokenIs(expected: String): Boolean {
        if (tokens.size > 0)
            return expected == tokens.first()
        else
            return false
    }

    private fun nextTokenIsVariable(): Boolean {
        if (tokens.size > 0)
            // Every token that id not a reserved token has to be a variable
            return !reservedTokens.contains(tokens.first())
        else
            return false
    }

    private fun consume() {
        if (tokens.size == 0)
            throw InvalidFormulaFormat("Expected token but got end of input")
        tokens.removeAt(0)
    }

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

        private val oneCharToken = Regex("[\\(\\)!&\\|]")
        private val whitespace = Regex("\\s")

        // Might be reasonable to treat the first character of a varname
        // differently from the rest of the variable in the future
        // Note that the current implementation implies/requires that
        // VarStartChars is a subset of VarChars
        private val permittedVarStartChars = Regex("[a-zA-Z0-9]")
        private val permittedVarChars = permittedVarStartChars

        fun tokenize(formula: String): MutableList<String> {
            val tokens = mutableListOf<String>()
            var i = 0

            while (i < formula.length) {
                i = extractToken(formula, i, tokens)
            }

            return tokens
        }

        @Suppress("ComplexMethod", "MagicNumber")
        private fun extractToken(formula: String, index: Int, tokens: MutableList<String>): Int {
            var i = index
            if (oneCharToken matches formula[i].toString()) {
                tokens.add(formula[i].toString())
                i += 1
            } else if (i + 2 < formula.length && formula.substring(i, i + 3) == "-->") {
                tokens.add("-->")
                i += 3
            } else if (i + 2 < formula.length && formula.substring(i, i + 3) == "<=>") {
                tokens.add("<=>")
                i += 3
            } else if (whitespace matches formula[i].toString()) {
                i += 1
            } else if (permittedVarStartChars matches formula[i].toString()) {
                i = extractIdentifier(formula, i, tokens)
            } else {
                throw InvalidFormulaFormat("Incorrect formula syntax at char $i")
            }
            return i
        }

        private fun extractIdentifier(formula: String, index: Int, tokens: MutableList<String>): Int {
            var identifier = ""
            var i = index
            while (i < formula.length && permittedVarChars matches formula[i].toString()) {
                identifier += formula[i]
                i += 1
            }
            tokens.add(identifier)
            return i
        }
    }
}
