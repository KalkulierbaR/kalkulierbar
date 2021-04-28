package kalkulierbar.logic.transform

import kalkulierbar.CNF_BLOWUP_LIMIT
import kalkulierbar.FormulaConversionException
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.*

/**
 * Visitor-based implementation of a first order CNF transformation
 * based on Skolem normal form
 */
class FirstOrderCNF : LogicNodeVisitor<ClauseSet<Relation>>() {

    companion object Companion {
        /**
         * Transforms a first order formula into an equivalent ClauseSet
         * The output clause set is a CNF representation of the quantor-free
         * core of the formula in Skolem normal form, with all variables
         * implicitly universally quantified
         *
         * NOTE: The resulting ClauseSet may grow exponentially with the input formula size
         *       Should the resulting ClauseSet exceed a certain size, an exception will be thrown
         * @param formula Formula to convert
         * @return ClauseSet equivalent to the input formula
         */
        fun transform(formula: LogicNode): ClauseSet<Relation> {
            val instance = FirstOrderCNF()
            return SkolemNormalForm.transform(formula).accept(instance)
        }
    }

    /**
     * Transform a Relation into an equivalent ClauseSet
     * @param node Relation to transform
     * @return ClauseSet representing the Relation
     */
    override fun visit(node: Relation): ClauseSet<Relation> {
        val atom = Atom(node, false)
        val clause = Clause(mutableListOf(atom))
        return ClauseSet(mutableListOf(clause))
    }

    /**
     * Transform a Negation-Operation into an equivalent ClauseSet
     * @param node Negation to transform
     * @return ClauseSet representing the Negation
     */
    override fun visit(node: Not): ClauseSet<Relation> {
        val res: ClauseSet<Relation>
        val child = node.child

        // Negation pushdown has already been performed by SNF conversion,
        // negations can only occur in front of relations
        when (child) {
            is Relation -> {
                val atom = Atom(child, true)
                val clause = Clause(mutableListOf(atom))
                res = ClauseSet(mutableListOf(clause))
            }
            else -> {
                val msg = "Unknown LogicNode encountered during first order CNF transformation"
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
    override fun visit(node: And): ClauseSet<Relation> {
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
    override fun visit(node: Or): ClauseSet<Relation> {
        val leftClauses = node.leftChild.accept(this).clauses
        val rightClauses = node.rightChild.accept(this).clauses
        val cs = ClauseSet<Relation>()

        // Not limiting resulting clause amount causes server to run out of memory attempting conversion
        // Don't mess with exponential growth
        if (leftClauses.size * rightClauses.size > CNF_BLOWUP_LIMIT)
            throw FormulaConversionException("First order CNF transformation resulted in too heavy blow-up")

        for (lc in leftClauses) {
            for (rc in rightClauses) {
                val atoms = mutableListOf<Atom<Relation>>()
                atoms.addAll(lc.atoms)
                atoms.addAll(rc.atoms)
                val clause = Clause(atoms)
                cs.add(clause)
            }
        }

        return cs
    }

    /**
     * 'Skip' universal quantifiers during CNF conversion
     * @param node Universal quantifier encountered
     * @return ClauseSet representing the sub-formula without the quantifier
     */
    override fun visit(node: UniversalQuantifier): ClauseSet<Relation> {
        return node.child.accept(this)
    }
}
