package kalkulierbar.parsers

import kalkulierbar.IncorrectArityException
import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.*
import kalkulierbar.logic.Function

/**
 * Recursive descent parser for first-order logic
 * For format specification, see docs/FirstOrderFormula.md
 */
@Suppress("TooManyFunctions")
class FirstOrderParser : PropositionalParser() {

    companion object {
        val instance = FirstOrderParser()

        fun parse(formula: String) = instance.parse(formula)

        fun parseTerm(term: String) = instance.parseTerm(term)

        fun parseRelation(relation: String) = instance.parseRelation(relation)

        fun parseConstant(constant: String) = instance.parseConstant(constant)
    }

    // List of quantifier scopes for correct variable binding
    private val quantifierScope = mutableListOf<MutableList<QuantifiedVariable>>()
    private var bindQuantifiedVariables = true
    private val arities = mutableMapOf<String, Int>()
    private val constants = mutableSetOf<String>()
    private val functionNames = mutableSetOf<String>()
    private val boundVars = mutableSetOf<String>()
    private val relationNames = mutableSetOf<String>()

    /**
     * Parses a first order formula
     * @param formula input formula
     * @return LogicNode representing the formula
     */
    override fun parse(formula: String, positionInBaseString: Int): LogicNode {
        // Clear quantifier scope to avoid problems on instance re-use
        quantifierScope.clear()
        arities.clear()
        constants.clear()
        functionNames.clear()
        boundVars.clear()
        relationNames.clear()
        bindQuantifiedVariables = true
        return super.parse(formula, positionInBaseString)
    }

    /**
     * Parses a first order term
     * @param term input term
     * @return FirstOrderTerm representing the term
     */
    fun parseTerm(term: String): FirstOrderTerm {
        tokens = Tokenizer.tokenize(term, extended = true) // Allow extended identifier chars
        bindQuantifiedVariables = false
        arities.clear()
        constants.clear()
        functionNames.clear()
        boundVars.clear()
        relationNames.clear()
        val res = parseTerm()
        if (tokens.isNotEmpty())
            throw InvalidFormulaFormat("Expected end of term but got ${gotMsg()}")

        return res
    }

    /**
     * Parses a relation / an atomic formula
     * @param relation input relation
     * @return Relation node representing the relation
     */
    fun parseRelation(relation: String): Relation {
        tokens = Tokenizer.tokenize(relation)
        bindQuantifiedVariables = false
        val res = parseAtomic()
        if (tokens.isNotEmpty())
            throw InvalidFormulaFormat("Expected end of term but got ${gotMsg()}")

        return res
    }

    /**
     * Parses a first order constant
     * @param constant input constant
     * @return FirstOrderTerm representing the constant
     */
    fun parseConstant(constant: String): FirstOrderTerm {
        tokens = Tokenizer.tokenize(constant, extended = true) // Allow extended identifier chars
        bindQuantifiedVariables = false
        if (!nextTokenIsIdentifier())
            throw InvalidFormulaFormat("Expected identifier but got ${gotMsg()}")
        if (!nextTokenIs(TokenType.LOWERID))
            throw InvalidFormulaFormat("Expected '${TokenType.LOWERID}' but got ${gotMsg()}")
        // Next token is constant or function
        val identifier = tokens.first().spelling
        consume()
        if (tokens.isNotEmpty())
            throw InvalidFormulaFormat("Expected end of constant but got ${gotMsg()}")

        return Constant(identifier)
    }

    /**
     * Parses a unary not
     * @return LogicNode representing the negated formula
     */
    override fun parseNot(): LogicNode {
        return if (nextTokenIs(TokenType.NOT)) {
            consume()
            Not(parseNot())
        } else {
            parseQuantifier()
        }
    }

    /**
     * Parses a series of 0 or more quantifiers, both existential and universal
     * @return LogicNode representing the series of quantifiers
     */
    private fun parseQuantifier(): LogicNode {

        if (!nextTokenIs(TokenType.UNIVERSALQUANT) && !nextTokenIs(TokenType.EXISTENTIALQUANT))
            return parseParen()

        val quantType = tokens.first().type
        consume()

        if (!nextTokenIs(TokenType.CAPID))
            throw InvalidFormulaFormat("Expected quantified variable but got ${gotMsg()}")

        val varName = tokens.first().spelling
        consume()
        consume(TokenType.COLON)

        // Open a new scope for this quantifier
        // All QuantifiedVariables encountered in the subexpression will be added there
        quantifierScope.add(mutableListOf())

        val subexpression = parseNot()

        // Bound variables are variables with the spelling specified in the quantifier
        // Variables encountered with other spellings may be bound by surrounding quantifiers
        val boundVariables = quantifierScope.last().filter { it.spelling == varName }.toMutableList()
        val boundBefore = quantifierScope.last().filter { it.spelling != varName }
        quantifierScope.removeAt(quantifierScope.size - 1) // Close the scope

        // If not yet bound variables remain in our scope, add them to the next higher scope
        // If no scope exists, the variables are unbound and the formula is incorrect
        if (quantifierScope.size == 0 && boundBefore.isNotEmpty())
            throw InvalidFormulaFormat("Unbound Variables found: ${boundBefore.joinToString(", ")}")
        else if (boundBefore.isNotEmpty())
            quantifierScope.last().addAll(boundBefore)

        if (relationNames.contains(varName))
            throw InvalidFormulaFormat("Identifier '$varName' is used both as a relation and bound variable")
        boundVars.add(varName)

        return if (quantType == TokenType.UNIVERSALQUANT)
            UniversalQuantifier(varName, subexpression, boundVariables)
        else
            ExistentialQuantifier(varName, subexpression, boundVariables)
    }

    /**
     * Parses a parenthesis in a formula
     * @return LogicNode representing the contents of the parenthesis
     */
    override fun parseParen(): LogicNode {
        return if (nextTokenIs(TokenType.LPAREN)) {
            consume()
            val exp = parseEquiv()
            consume(TokenType.RPAREN)
            exp
        } else {
            parseAtomic()
        }
    }

    /**
     * Parses an atomic formula / a relation
     * @return LogicNode representing the parsed Relation
     */
    private fun parseAtomic(): Relation {
        if (!nextTokenIs(TokenType.CAPID))
            throw InvalidFormulaFormat("Expected relation identifier but got ${gotMsg()}")

        val relationIdentifier = tokens.first().spelling
        consume()
        consume(TokenType.LPAREN)

        // Relation may have an arbitrary amount of argument terms
        val arguments = mutableListOf<FirstOrderTerm>()
        if (! nextTokenIs(TokenType.RPAREN)) {
            arguments.add(parseTerm())
        }
        while (nextTokenIs(TokenType.COMMA)) {
            consume()
            arguments.add(parseTerm())
        }

        consume(TokenType.RPAREN)

        if (arities.contains(relationIdentifier)) {
            val expected = arities[relationIdentifier]
            val arity = arguments.size
            if (arity != expected) {
                throw IncorrectArityException("Relation $relationIdentifier should have arity $expected but has $arity")
            }
        } else {
            arities[relationIdentifier] = arguments.size
        }

        if (boundVars.contains(relationIdentifier))
            throw InvalidFormulaFormat("Identifier '$relationIdentifier' is used both as a relation and bound variable")
        relationNames.add(relationIdentifier)

        return Relation(relationIdentifier, arguments)
    }

    /**
     * Parses a first-order term made up of quantified variables,
     * constants, and functions
     * @return FirstOrderTerm representing the parsed term
     */
    private fun parseTerm(): FirstOrderTerm {
        if (!nextTokenIsIdentifier())
            throw InvalidFormulaFormat("Expected identifier but got ${gotMsg()}")

        return if (nextTokenIs(TokenType.CAPID)) {
            // Next token is quantified variable
            parseQuantifiedVariable()
        } else {
            // Next token is constant or function
            val identifier = tokens.first().spelling
            consume()
            if (nextTokenIs(TokenType.LPAREN))
                parseFunction(identifier)
            else {
                if (functionNames.contains(identifier))
                    throw InvalidFormulaFormat("Identifier '$identifier' is used both as a function and constant")
                constants.add(identifier)
                Constant(identifier)
            }
        }
    }

    /**
     * Parses a function invocation
     * Note: This is called when the name of the function is already consumed
     *       due to ambiguity between functions and constants
     *       The consumed name is passed as an argument to this function instead
     * @param identifier Name of the function invoked
     * @return FirstOrderTerm representing the function invocation
     */
    private fun parseFunction(identifier: String): FirstOrderTerm {
        consume(TokenType.LPAREN)

        val arguments = mutableListOf<FirstOrderTerm>()
        if (!nextTokenIs(TokenType.RPAREN)) {
            arguments.add(parseTerm())
        }
        while (nextTokenIs(TokenType.COMMA)) {
            consume()
            arguments.add(parseTerm())
        }

        consume(TokenType.RPAREN)

        if (arities.contains(identifier)) {
            val expected = arities[identifier]
            val arity = arguments.size
            if (arity != expected) {
                throw IncorrectArityException("Function $identifier should have arity $expected but has $arity")
            }
        } else {
            arities[identifier] = arguments.size
        }

        if (constants.contains(identifier))
            throw InvalidFormulaFormat("Identifier '$identifier' is used both as a function and constant")
        functionNames.add(identifier)

        return Function(identifier, arguments)
    }

    /**
     * Parses a quantified variable and adds it to the current scope
     * @return FirstOrderTerm representing the quantified variable
     */
    private fun parseQuantifiedVariable(): FirstOrderTerm {
        val res = QuantifiedVariable(tokens.first().spelling)

        // Add variable to list of bound variables so the binding quantifier is informed of its existence
        if (quantifierScope.size == 0 && bindQuantifiedVariables)
            throw InvalidFormulaFormat("Unbound variable ${gotMsg()}")

        if (bindQuantifiedVariables)
            quantifierScope.last().add(res)

        if (relationNames.contains(res.spelling))
            throw InvalidFormulaFormat("Identifier '${res.spelling}' is used both as a relation and bound variable")
        boundVars.add(res.spelling)

        consume(TokenType.CAPID)
        return res
    }
}
