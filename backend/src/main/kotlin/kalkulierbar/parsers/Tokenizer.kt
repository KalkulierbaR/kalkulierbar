package kalkulierbar.parsers

import kalkulierbar.InvalidFormulaFormat

/**
 * Tokenizer for first-order and propositional logic formulae
 */
class Tokenizer {
    companion object Companion {

        // Single-character tokens can be handled in one step
        protected val oneCharToken = Regex("[\\(\\)!&\\|,\\:]")
        protected val whitespace = Regex("\\s")

        // Might be reasonable to treat the first character of a varname
        // differently from the rest of the variable in the future
        // Note that the current implementation implies/requires that
        // VarStartChars is a subset of VarChars
        protected val permittedVarStartChars = Regex("[a-zA-Z0-9]")
        protected val permittedVarChars = permittedVarStartChars

        /**
	     * Splits a raw formula into its tokens, removes whitespace etc
	     * @param formula Input formula to tokenize
	     * @return list of extracted tokens
	     */
        fun tokenize(formula: String): MutableList<Token> {
            val tokens = mutableListOf<Token>()
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
        protected fun extractToken(formula: String, index: Int, tokens: MutableList<Token>): Int {
            var i = index
            val len = formula.length

            // If the next token is one char only, we can add it to the list directly
            if (oneCharToken matches formula[i].toString()) {
                val ttype: TokenType

                when (formula[i]) {
                    '&' -> ttype = TokenType.AND
                    '|' -> ttype = TokenType.OR
                    '!' -> ttype = TokenType.NOT
                    '(' -> ttype = TokenType.LPAREN
                    ')' -> ttype = TokenType.RPAREN
                    ',' -> ttype = TokenType.COMMA
                    ':' -> ttype = TokenType.COLON
                    else -> ttype = TokenType.UNKNOWN
                }

                tokens.add(Token(ttype, formula[i].toString(), i))
                i += 1
            } else if (i + 1 < len && formula.substring(i, i + 2) == "->") {
                tokens.add(Token(TokenType.IMPLICATION, "->", i))
                i += 2
            } else if (i + 2 < len && formula.substring(i, i + 3) == "<=>") {
                tokens.add(Token(TokenType.EQUIVALENCE, "<=>", i))
                i += 3
            } else if (i + 2 < len && formula.substring(i, i + 3) == "<->") {
                tokens.add(Token(TokenType.EQUIVALENCE, "<->", i))
                i += 3
            } else if (i + 2 < len && formula.substring(i, i + 3) == "\\ex") {
                tokens.add(Token(TokenType.EXISTENTIALQUANT, "\\ex", i))
                i += 3
            } else if (i + 3 < len && formula.substring(i, i + 4) == "\\all") {
                tokens.add(Token(TokenType.UNIVERSALQUANT, "\\all", i))
                i += 4
            } else if (whitespace matches formula[i].toString()) {
                i += 1 // Skip whitespace
            } else if (permittedVarStartChars matches formula[i].toString()) {
                var identifier = ""
                val ttype = if (formula[i].isUpperCase()) TokenType.CAPID else TokenType.LOWERID
                val startIndex = i

                // Extract identifier
                while (i < formula.length && permittedVarChars matches formula[i].toString()) {
                    identifier += formula[i]
                    i += 1
                }
                tokens.add(Token(ttype, identifier, startIndex))
            } else {
                throw InvalidFormulaFormat("Incorrect formula syntax at char $i")
            }
            return i
        }
    }
}

/**
 * Class representing a single token
 */
data class Token(val type: TokenType, val spelling: String, val srcPosition: Int) {
    override fun toString() = spelling
}

enum class TokenType(val stringRep: String) {
    AND("&"), OR("|"), NOT("!"), IMPLICATION("->"), EQUIVALENCE("<=>"), LPAREN("("), RPAREN(")"),
    COMMA(","), COLON(":"), CAPID("uppercase identifier"), LOWERID("lowercase identifier"),
    UNIVERSALQUANT("\\all"), EXISTENTIALQUANT("\\ex"), UNKNOWN("unknown token");

    override fun toString() = stringRep
}
