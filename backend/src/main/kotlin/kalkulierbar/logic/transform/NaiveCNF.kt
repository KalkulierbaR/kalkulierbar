package kalkulierbar.logic.transform

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

class NaiveCNF : LogicNodeVisitor<ClauseSet>() {

    companion object Companion {
        /**
         * Transforms an arbitrary formula into an equivalent ClauseSet
         * NOTE: The resulting ClauseSet may grow exponentially with the input formula size
         *       Should the resulting ClauseSet exceed a certain size, an exception will be thrown
         * @param formula Formula to convert
         * @return ClauseSet equivalent to the input formula
         */
        fun transform(formula: LogicNode): ClauseSet {
            val instance = NaiveCNF()
            return formula.accept(instance)
        }
    }

    override fun visit(node: Var): ClauseSet {
        val atom = Atom(node.spelling, false)
        val clause = Clause(mutableListOf(atom))
        return ClauseSet(mutableListOf(clause))
    }

    override fun visit(node: Not): ClauseSet {
        val res: ClauseSet
        val child = node.child

        // Perform Negation-Pushdown
        when (child) {
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

    override fun visit(node: And): ClauseSet {
        val leftCS = node.leftChild.accept(this)
        val rightCS = node.rightChild.accept(this)
        leftCS.unite(rightCS)
        return leftCS
    }

    @Suppress("MagicNumber")
    override fun visit(node: Or): ClauseSet {
        val leftClauses = node.leftChild.accept(this).clauses
        val rightClauses = node.rightChild.accept(this).clauses
        val cs = ClauseSet()

        // Not limiting resulting clause amount causes server to run out of memory attempting conversion
        // Don't mess with exponential growth
        if (leftClauses.size * rightClauses.size > 100000)
            throw FormulaConversionException("Naive CNF transformation resulted in too heavy blow-up")

        for (lc in leftClauses) {
            for (rc in rightClauses) {
                val atoms = mutableListOf<Atom>()
                atoms.addAll(lc.atoms)
                atoms.addAll(rc.atoms)
                val clause = Clause(atoms)
                cs.add(clause)
            }
        }

        return cs
    }

    override fun visit(node: Impl): ClauseSet {
        return node.toBasicOps().accept(this)
    }

    override fun visit(node: Equiv): ClauseSet {
        return node.toBasicOps().accept(this)
    }
}
