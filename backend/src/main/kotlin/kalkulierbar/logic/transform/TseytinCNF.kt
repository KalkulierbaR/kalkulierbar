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

class TseytinCNF : LogicNodeVisitor<Unit>() {

    companion object Companion {
        /**
         * Transforms an arbitrary formula into a ClauseSet that is equivalent with regards to satisfiability
         * For more information, see https://en.wikipedia.org/wiki/Tseytin_transformation
         * NOTE: The resulting ClauseSet will contain additional variables, making the ClauseSet NOT equivalent
         *       to the input formula
         * @return ClauseSet of equal satisfiability as this logic node
         */

        /**
         * Recursively applies Tseytin transformation on a logic node
         * Adds generated CNF snippets to a given ClauseSet
         * CNF snippets based on http://gauss.ececs.uc.edu/Courses/c626/lectures/BDD/st.pdf
         * @param cs ClauseSet to add generated clauses to
         * @param index ID of the current node in the logic tree (pre-order numbering)
         * @return ID of the next logic tree node (pre-order numbering)
         */
        fun transform(formula: LogicNode): ClauseSet {
            val instance = TseytinCNF()
            val res = ClauseSet()

            val rootClause = Clause(mutableListOf(Atom(instance.getName(formula), false)))
            res.add(rootClause)

            formula.accept(instance)

            res.unite(instance.cs)
            return res
        }
    }

    private var index = 0
    private val cs = ClauseSet()

    private fun getName(node: LogicNode): String {
        return when (node) {
            is Not -> "not$index"
            is Or -> "or$index"
            is And -> "and$index"
            is Impl -> "impl$index"
            is Equiv -> "equiv$index"
            is Var -> "var${node.spelling}"
            else -> {
                val msg = "Unknown LogicNode encountered during naive CNF transformation"
                throw FormulaConversionException(msg)
            }
        }
    }

    override fun visit(node: Var) {
        index += 1
    }

    override fun visit(node: Not) {
        val selfVar = getName(node)
        index += 1
        val childVar = getName(node.child)
        node.child.accept(this)

        val clauseA = Clause(mutableListOf(Atom(childVar, true), Atom(selfVar, true)))
        val clauseB = Clause(mutableListOf(Atom(childVar, false), Atom(selfVar, false)))
        cs.addAll(listOf(clauseA, clauseB))
    }

    override fun visit(node: And) {
        val selfVar = getName(node)
        index += 1
        val leftChildVar = getName(node.leftChild)
        node.leftChild.accept(this)
        val rightChildVar = getName(node.rightChild)
        node.rightChild.accept(this)

        val clauseA = Clause(mutableListOf(Atom(leftChildVar, false), Atom(selfVar, true)))
        val clauseB = Clause(mutableListOf(Atom(rightChildVar, false), Atom(selfVar, true)))
        val clauseC = Clause(mutableListOf(Atom(leftChildVar, true), Atom(rightChildVar, true), Atom(selfVar, false)))
        cs.addAll(listOf(clauseA, clauseB, clauseC))
    }

    override fun visit(node: Or) {
        val selfVar = getName(node)
        index += 1
        val leftChildVar = getName(node.leftChild)
        node.leftChild.accept(this)
        val rightChildVar = getName(node.rightChild)
        node.rightChild.accept(this)

        val clauseA = Clause(mutableListOf(Atom(leftChildVar, true), Atom(selfVar, false)))
        val clauseB = Clause(mutableListOf(Atom(rightChildVar, true), Atom(selfVar, false)))
        val clauseC = Clause(mutableListOf(Atom(leftChildVar, false), Atom(rightChildVar, false), Atom(selfVar, true)))
        cs.addAll(listOf(clauseA, clauseB, clauseC))
    }

    override fun visit(node: Impl) {
        val selfVar = getName(node)
        index += 1
        val leftChildVar = getName(node.leftChild)
        node.leftChild.accept(this)
        val rightChildVar = getName(node.rightChild)
        node.rightChild.accept(this)

        val clauseA = Clause(mutableListOf(Atom(leftChildVar, false), Atom(selfVar, false)))
        val clauseB = Clause(mutableListOf(Atom(rightChildVar, true), Atom(selfVar, false)))
        val clauseC = Clause(mutableListOf(Atom(leftChildVar, true), Atom(rightChildVar, false), Atom(selfVar, true)))
        cs.addAll(listOf(clauseA, clauseB, clauseC))
    }

    override fun visit(node: Equiv) {
        val selfVar = getName(node)
        index += 1
        val leftChildVar = getName(node.leftChild)
        node.leftChild.accept(this)
        val rightChildVar = getName(node.rightChild)
        node.rightChild.accept(this)

        val clauseA = Clause(mutableListOf(Atom(leftChildVar, false), Atom(rightChildVar, true), Atom(selfVar, true)))
        val clauseB = Clause(mutableListOf(Atom(leftChildVar, true), Atom(rightChildVar, false), Atom(selfVar, true)))
        val clauseC = Clause(mutableListOf(Atom(leftChildVar, true), Atom(rightChildVar, true), Atom(selfVar, false)))
        val clauseD = Clause(mutableListOf(Atom(leftChildVar, false), Atom(rightChildVar, false), Atom(selfVar, false)))
        cs.addAll(listOf(clauseA, clauseB, clauseC, clauseD))
    }
}
