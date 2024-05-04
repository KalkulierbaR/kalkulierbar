package kalkulierbar.logic.transform

import kalkulierbar.CNF_BLOWUP_LIMIT
import kalkulierbar.FormulaConversionException
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.And
import kalkulierbar.logic.Equiv
import kalkulierbar.logic.Impl
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Var

/**
 * Visitor-based implementation of the naive CNF transformation
 *
 * Does NOT support first order formulae
 */
class NaiveCNF : LogicNodeVisitor<ClauseSet<String>>() {

    companion object Companion {
        /**
         * Transforms a propositional formula into an equivalent ClauseSet
         * NOTE: The resulting ClauseSet may grow exponentially with the input formula size
         *       Should the resulting ClauseSet exceed a certain size, an exception will be thrown
         * @param formula Formula to convert
         * @return ClauseSet equivalent to the input formula
         */
        fun transform(formula: LogicNode): ClauseSet<String> {
            val instance = NaiveCNF()
            return formula.accept(instance)
        }
    }

    /**
     * Transform a Variable into an equivalent ClauseSet
     * @param node Variable to transform
     * @return ClauseSet representing the Variable
     */
    override fun visit(node: Var): ClauseSet<String> {
        val atom = Atom(node.spelling, false)
        val clause = Clause(mutableListOf(atom))
        return ClauseSet(mutableListOf(clause))
    }

    /**
     * Transform a Negation-Operation into an equivalent ClauseSet
     * @param node Negation to transform
     * @return ClauseSet representing the Negation
     */
    override fun visit(node: Not): ClauseSet<String> {
        val res: ClauseSet<String>

        // Perform Negation-Pushdown
        when (val child = node.child) {
            is Not -> {
                // Eliminate double negation
                res = child.child.accept(this)
            }
            is Or -> {
                // De-Morgan Or
                res = And(Not(child.leftChild), Not(child.rightChild)).accept(this)
            }
            is And -> {
                // De-Morgan And
                res = Or(Not(child.leftChild), Not(child.rightChild)).accept(this)
            }
            is Impl -> {
                // !(a->b) = !(!a v b) = a^!b
                res = And(child.leftChild, Not(child.rightChild)).accept(this)
            }
            is Equiv -> {
                val implA = Impl(child.leftChild, child.rightChild)
                val implB = Impl(child.rightChild, child.leftChild)
                // Translate equivalence into implications
                res = Not(And(implA, implB)).accept(this)
            }
            is Var -> {
                val atom = Atom(child.spelling, true)
                val clause = Clause(mutableListOf(atom))
                res = ClauseSet(mutableListOf(clause))
            }
            else -> {
                val msg = "Unknown LogicNode encountered during naive CNF transformation"
                throw FormulaConversionException(msg)
            }
        }

        return res
    }

    /**
     * Transform an And-Operator into an equivalent ClauseSet
     * @param node And-Operator to transform
     * @return ClauseSet representing the And-Operator
     */
    override fun visit(node: And): ClauseSet<String> {
        val leftCS = node.leftChild.accept(this)
        val rightCS = node.rightChild.accept(this)
        leftCS.unite(rightCS)
        return leftCS
    }

    /**
     * Transform a Or-Operator into an equivalent ClauseSet
     * @param node Or-Operator to transform
     * @return ClauseSet representing the Or-Operator
     */
    override fun visit(node: Or): ClauseSet<String> {
        val leftClauses = node.leftChild.accept(this).clauses
        val rightClauses = node.rightChild.accept(this).clauses
        val cs = ClauseSet<String>()

        // Not limiting resulting clause amount causes server to run out of memory attempting conversion
        // Don't mess with exponential growth
        if (leftClauses.size * rightClauses.size > CNF_BLOWUP_LIMIT) {
            throw FormulaConversionException("Naive CNF transformation resulted in too heavy blow-up")
        }
        for (lc in leftClauses) {
            for (rc in rightClauses) {
                val atoms = mutableListOf<Atom<String>>()
                atoms.addAll(lc.atoms)
                atoms.addAll(rc.atoms)
                val clause = Clause(atoms)
                cs.add(clause)
            }
        }

        return cs
    }

    /**
     * Transform an Implication into an equivalent ClauseSet
     * @param node Implication to transform
     * @return ClauseSet representing the Implication
     */
    override fun visit(node: Impl): ClauseSet<String> {
        return ToBasicOps.transform(node).accept(this)
    }

    /**
     * Transform an Equivalence into an equivalent ClauseSet
     * @param node Equivalence to transform
     * @return ClauseSet representing the Equivalence
     */
    override fun visit(node: Equiv): ClauseSet<String> {
        return ToBasicOps.transform(node).accept(this)
    }
}
