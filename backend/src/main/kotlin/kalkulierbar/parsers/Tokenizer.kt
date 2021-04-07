package kalkulierbar.parsers

import kalkulierbar.InvalidFormulaFormat

/**
 * Tokenizer for first-order and propositional logic formulae
 */
class Tokenizer {
    companion object Companion {

        // Single-character tokens can be handled in one step
        private val oneCharToken = Regex("[\\(\\)!&\\|,\\:]")
        private val whitespace = Regex("\\s")

        // Might be reasonable to treat the first character of a varname
        // differently from the rest of the variable in the future
        // Note that the current implementation implies/requires that
        // VarStartChars is a subset of VarChars
        private val permittedVarStartChars = Regex("[a-zA-Z0-9]")
        private val permittedVarChars = permittedVarStartChars
        private val extendedVarChars = Regex("[_-]")
        private var allowExtended = false

        /**
         * Splits a raw formula into its tokens, removes whitespace etc
         * @param formula Input formula to tokenize
         * @return list of extracted tokens
         */
        fun tokenize(formula: String, extended: Boolean = false, positionInBaseString: Int = 0): MutableList<Token> {
            val tokens = mutableListOf<Token>()
            var i = 0

            allowExtended = extended

            // Extract single token until end of input reached
            while (i < formula.length) {
                i = extractToken(formula, i, tokens, positionInBaseString)
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
        private fun extractToken(formula: String, index: Int, tokens: MutableList<Token>, positionInBaseString: Int): Int {
            var i = index
            val len = formula.length

            // Accept both \quant and /quant spellings
            val allquant = Regex("[\\\\/]all")
            val exquant = Regex("[\\\\/]ex")

            // If the next token is one char only, we can add it to the list directly
            if (oneCharToken matches formula[i].toString()) {
                val ttype = when (formula[i]) {
                    '&' -> TokenType.AND
                    '|' -> TokenType.OR
                    '!' -> TokenType.NOT
                    '(' -> TokenType.LPAREN
                    ')' -> TokenType.RPAREN
                    ',' -> TokenType.COMMA
                    ':' -> TokenType.COLON
                    else -> TokenType.UNKNOWN
                }

                tokens.add(Token(ttype, formula[i].toString(), i))
                i += 1
            } else if (i + 1 < len && formula.substring(i, i + 2) == "->") {
                tokens.add(Token(TokenType.IMPLICATION, "->", i + positionInBaseString))
                i += 2
            } else if (i + 2 < len && formula.substring(i, i + 3) == "<=>") {
                tokens.add(Token(TokenType.EQUIVALENCE, "<=>", i + positionInBaseString))
                i += 3
            } else if (i + 2 < len && formula.substring(i, i + 3) == "<->") {
                tokens.add(Token(TokenType.EQUIVALENCE, "<->", i + positionInBaseString))
                i += 3
            } else if (i + 2 < len && formula.substring(i, i + 3) matches exquant) {
                tokens.add(Token(TokenType.EXISTENTIALQUANT, "\\ex", i + positionInBaseString))
                i += 3
            } else if (i + 3 < len && formula.substring(i, i + 4) matches allquant) {
                tokens.add(Token(TokenType.UNIVERSALQUANT, "\\all", i + positionInBaseString))
                i += 4
            } else if (i + 1 < len && formula.substring(i, i + 2) == "[]") {
                tokens.add(Token(TokenType.BOX, "[]", i + positionInBaseString))
                i += 2
            } else if (i + 1 < len && formula.substring(i, i + 2) == "<>") {
                tokens.add(Token(TokenType.DIAMOND, "<>", i + positionInBaseString))
                i += 2
            } else if (whitespace matches formula[i].toString()) {
                i += 1 // Skip whitespace
            } else if (permittedVarStartChars matches formula[i].toString()) {
                var identifier = ""
                val ttype = if (formula[i].isUpperCase()) TokenType.CAPID else TokenType.LOWERID
                val startIndex = i

                // Extract identifier
                while (i < formula.length && isAllowedChar(formula[i])) {
                    identifier += formula[i]
                    i += 1
                }
                tokens.add(Token(ttype, identifier, startIndex + positionInBaseString))
            } else {
                throw InvalidFormulaFormat("Incorrect formula syntax at char " + (i + positionInBaseString).toString())
            }
            return i
        }

        /**
         * Check if a character is allowed within an identifier
         * @param char Character to check
         * @return true iff the character is allowed as part of an identifier
         */
        fun isAllowedChar(char: Char): Boolean {
            val cs = char.toString()
            return permittedVarChars matches cs || (allowExtended && extendedVarChars matches cs)
        }
    }
}

/**
 * Class representing a single token
 */
data class Token(val type: TokenType, val spelling: String, val srcPosition: Int) {
    override fun toString() = spelling
}

enum class TokenType(private val stringRep: String) {
    AND("&"), OR("|"), NOT("!"), IMPLICATION("->"), EQUIVALENCE("<=>"), LPAREN("("), RPAREN(")"),
    COMMA(","), COLON(":"), CAPID("uppercase identifier"), LOWERID("lowercase identifier"),
    UNIVERSALQUANT("\\all"), EXISTENTIALQUANT("\\ex"), UNKNOWN("unknown token"), BOX("[]"), DIAMOND("<>");

    override fun toString() = stringRep
}
