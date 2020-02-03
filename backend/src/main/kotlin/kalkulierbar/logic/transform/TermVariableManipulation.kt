package kalkulierbar.logic.transform

import kalkulierbar.FormulaConversionException
import kalkulierbar.logic.And
import kalkulierbar.logic.Constant
import kalkulierbar.logic.Equiv
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.Function
import kalkulierbar.logic.Impl
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Quantifier
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier

class VariableInstantiator(val replacementMap: Map<String, FirstOrderTerm>) : FirstOrderTermVisitor<FirstOrderTerm>() {

    companion object {
        /**
         * Instantiate the variables given in the map with their respective FO Term replacements
         * NOTE: This will break variable quantifier linking
         * @param term FO term to apply instantiations on
         * @param map Map of variable instantiations to perform
         * @return Term with instantiations applied
         */
        fun transform(term: FirstOrderTerm, map: Map<String, FirstOrderTerm>): FirstOrderTerm {
            val instance = VariableInstantiator(map)
            return term.accept(instance)
        }
    }

    /**
     * Replace a variable with its term if the variable name is found in the map
     * @param node QuantifiedVariable encountered
     * @return The Variable or its replacement term
     */
    override fun visit(node: QuantifiedVariable): FirstOrderTerm {
        if (replacementMap[node.spelling] != null) {
            // Clone the term to avoid object-sharing related weirdness
            return replacementMap[node.spelling]!!.clone()
        }

        return node
    }

    /**
     * Constants do not change
     * @param node Constant encountered
     * @return unchanged constant
     */
    override fun visit(node: Constant) = node

    /**
     * Apply transformation recusively on function arguments
     * @param node Function encountered
     * @return Function with transformed arguments
     */
    override fun visit(node: Function): FirstOrderTerm {
        node.arguments = node.arguments.map { it.accept(this) }

        return node
    }
}

class VariableSuffixAppend(val suffix: String) : FirstOrderTermVisitor<FirstOrderTerm>() {

    /**
     * Append the suffix to a Variable
     * @param node Variable encountered
     * @return Variable with suffix attached
     */
    override fun visit(node: QuantifiedVariable): FirstOrderTerm {
        node.spelling = "${node.spelling}$suffix"
        return node
    }

    /**
     * Constants do not change
     * @param node Constant encountered
     * @return unchanged constant
     */
    override fun visit(node: Constant) = node

    /**
     * Append the suffix to variables in function arguments
     * @param node Function encountered
     * @return Function with contained Variables transformed
     */
    override fun visit(node: Function): FirstOrderTerm {
        node.arguments = node.arguments.map { it.accept(this) }

        return node
    }
}

class TermContainsVariable(val variable: String) : FirstOrderTermVisitor<Boolean>() {

    companion object {
        /**
         * Check if a term contains a given Variable
         * @param term Term to check for variable occurrence
         * @param variable Variable to check for
         * @return true iff the term contains the variable
         */
        fun check(term: FirstOrderTerm, variable: String): Boolean {
            val instance = TermContainsVariable(variable)
            return term.accept(instance)
        }
    }

    /**
     * QuantifiedVariable may or may not be the one we are looking for
     * @param node QuantifiedVariable encountered
     * @return true iff the variable name is the specified name
     */
    override fun visit(node: QuantifiedVariable) = (node.spelling == variable)

    /**
     * Constants cannot contain variables
     * @param node Constant encountered
     * @return false
     */
    override fun visit(node: Constant) = false

    /**
     * Check if function arguments contain variable
     * @param node Function encountered
     * @return true iff at least one argument contains the variable
     */
    override fun visit(node: Function) = node.arguments.fold(false) { acc, term -> acc || term.accept(this) }
}

/**
 * Registers newly created variables in terms with their respective quantifiers
 * Variables will be bound to the innermost matching quantifier
 * @param quantifers List of quantifiers in whose scope the term in question resides
 * @param enforceUnique Set to true to ensure no variable hiding is taking place
 *        (i.e. binding quantifiers are unambiguous)
 */
class QuantifierLinker(val quantifiers: List<Quantifier>, val enforceUnique: Boolean) : FirstOrderTermVisitor<Unit>() {

    /**
     * Match a QuantifiedVariable to its binding quantifier
     * @param node QuantifiedVariable encountered
     */
    override fun visit(node: QuantifiedVariable) {
        val matchingQuantifiers = quantifiers.filter { it.varName == node.spelling }

        if (matchingQuantifiers.size == 0)
            throw FormulaConversionException("Error linking variables to quantifiers: " +
                "Variable '${node.spelling}' is not bound by any quantifier")
        else if (matchingQuantifiers.size > 1 && enforceUnique)
            throw FormulaConversionException("Error linking variables to quantifiers: " +
                "Variable '${node.spelling}' is bound by more than one quantifier")

        // The last-defined quantifier is the binding one for the variable occurrence
        matchingQuantifiers[matchingQuantifiers.size - 1].boundVariables.add(node)
    }

    @Suppress("EmptyFunctionBlock")
    override fun visit(node: Constant) {}

    override fun visit(node: Function) {
        node.arguments.forEach { it.accept(this) }
    }
}

/**
 * Collects used identifiers from a first-order formula
 */
class IdentifierCollector : LogicNodeVisitor<Unit>() {

    companion object {
        private val instance = IdentifierCollector()

        /**
         * Collect a set of all identifiers used in a formula
         * Including: Variables, constants, function- and relation names
         * @param formula Formula to collect identifiers from
         * @return Set of all identifiers found
         */
        fun collect(formula: LogicNode): Set<String> {
            instance.identifiers.clear()
            formula.accept(instance)
            return instance.identifiers
        }
    }

    private val identifiers = mutableSetOf<String>()
    private val termIdCollector = TermIdentifierCollector(identifiers)

    override fun visit(node: And) {
        node.leftChild.accept(this)
        node.rightChild.accept(this)
    }

    override fun visit(node: Or) {
        node.leftChild.accept(this)
        node.rightChild.accept(this)
    }

    override fun visit(node: Impl) {
        node.leftChild.accept(this)
        node.rightChild.accept(this)
    }

    override fun visit(node: Equiv) {
        node.leftChild.accept(this)
        node.rightChild.accept(this)
    }

    override fun visit(node: Not) {
        node.child.accept(this)
    }

    override fun visit(node: Relation) {
        identifiers.add(node.spelling)
        node.arguments.forEach {
            it.accept(termIdCollector)
        }
    }

    override fun visit(node: UniversalQuantifier) {
        identifiers.add(node.varName)
        node.child.accept(this)
    }

    override fun visit(node: ExistentialQuantifier) {
        identifiers.add(node.varName)
        node.child.accept(this)
    }
}

/**
 * Collects identifiers (function names, constants, variable names)
 * from first order terms
 * @param identifiers Set of identifiers to add found identifiers to
 */
class TermIdentifierCollector(val identifiers: MutableSet<String>) : FirstOrderTermVisitor<Unit>() {
    override fun visit(node: Constant) {
        identifiers.add(node.spelling)
    }

    override fun visit(node: QuantifiedVariable) {
        identifiers.add(node.spelling)
    }

    override fun visit(node: Function) {
        identifiers.add(node.spelling)
        node.arguments.forEach {
            it.accept(this)
        }
    }
}
