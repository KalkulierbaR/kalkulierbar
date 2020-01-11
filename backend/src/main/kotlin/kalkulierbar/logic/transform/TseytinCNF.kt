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

/**
 * Recursively applies Tseytin transformation on a logic node
 * CNF snippets based on http://gauss.ececs.uc.edu/Courses/c626/lectures/BDD/st.pdf
 */
class TseytinCNF : LogicNodeVisitor<Unit>() {

    companion object Companion {
        /**
         * Transforms an arbitrary formula into a ClauseSet that is equivalent with regards to satisfiability
         * For more information, see https://en.wikipedia.org/wiki/Tseytin_transformation
         * NOTE: The resulting ClauseSet will contain additional variables, making the ClauseSet NOT equivalent
         *       to the input formula
         * @param formula Formula to convert
         * @return ClauseSet of equal satisfiability as the given logic node
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

    /**
     * Compute the name of the tseytin variable representing a given sub-formula
     * @param node LogicNode to get variable name of
     * @return Tseytin variable name of the node
     */
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
