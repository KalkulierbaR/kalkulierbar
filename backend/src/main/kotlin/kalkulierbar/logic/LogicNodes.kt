package kalkulierbar.logic

import kalkulierbar.FormulaConversionException
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.transform.LogicNodeVisitor

class Var(var spelling: String) : LogicNode() {

    /**
     * Translates arbitrary formulae into equivalent representations
     * using only basic operations (var, not, and, or)
     * @return representation of this LogicNode using only basic logic operations
     */
    override fun toBasicOps() = this

    /**
     * Recursively applies Tseytin transformation on a logic node
     * Adds generated CNF snippets to a given ClauseSet
     * CNF snippets based on http://gauss.ececs.uc.edu/Courses/c626/lectures/BDD/st.pdf
     * @param cs ClauseSet to add generated clauses to
     * @param index ID of the current node in the logic tree (pre-order numbering)
     * @return ID of the next logic tree node (pre-order numbering)
     */
    override fun tseytin(cs: ClauseSet, index: Int) = index + 1

    override fun getTseytinName(index: Int) = "var$spelling"

    override fun toString() = spelling

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class Not(child: LogicNode) : UnaryOp(child) {

    /**
     * Recursively applies Tseytin transformation on a logic node
     * Adds generated CNF snippets to a given ClauseSet
     * CNF snippets based on http://gauss.ececs.uc.edu/Courses/c626/lectures/BDD/st.pdf
     * @param cs ClauseSet to add generated clauses to
     * @param index ID of the current node in the logic tree (pre-order numbering)
     * @return ID of the next logic tree node (pre-order numbering)
     */
    override fun tseytin(cs: ClauseSet, index: Int): Int {
        var i = index
        val selfVar = getTseytinName(i)
        i += 1
        val childVar = child.getTseytinName(i)
        i = child.tseytin(cs, i)
        val clauseA = Clause(mutableListOf(Atom(childVar, true), Atom(selfVar, true)))
        val clauseB = Clause(mutableListOf(Atom(childVar, false), Atom(selfVar, false)))

        cs.addAll(listOf(clauseA, clauseB))
        return i
    }

    override fun getTseytinName(index: Int) = "not$index"

    override fun toString() = "!$child"

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class And(leftChild: LogicNode, rightChild: LogicNode) : BinaryOp(leftChild, rightChild) {

    /**
     * Recursively applies Tseytin transformation on a logic node
     * Adds generated CNF snippets to a given ClauseSet
     * CNF snippets based on http://gauss.ececs.uc.edu/Courses/c626/lectures/BDD/st.pdf
     * @param cs ClauseSet to add generated clauses to
     * @param index ID of the current node in the logic tree (pre-order numbering)
     * @return ID of the next logic tree node (pre-order numbering)
     */
    override fun tseytin(cs: ClauseSet, index: Int): Int {
        var i = index
        val selfVar = getTseytinName(i)
        i += 1
        val leftChildVar = leftChild.getTseytinName(i)
        i = leftChild.tseytin(cs, i)
        val rightChildVar = rightChild.getTseytinName(i)
        i = rightChild.tseytin(cs, i)

        val clauseA = Clause(mutableListOf(Atom(leftChildVar, false), Atom(selfVar, true)))
        val clauseB = Clause(mutableListOf(Atom(rightChildVar, false), Atom(selfVar, true)))
        val clauseC = Clause(mutableListOf(Atom(leftChildVar, true), Atom(rightChildVar, true), Atom(selfVar, false)))
        cs.addAll(listOf(clauseA, clauseB, clauseC))

        return i
    }

    override fun getTseytinName(index: Int) = "and$index"

    override fun toString() = "($leftChild ∧ $rightChild)"

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class Or(leftChild: LogicNode, rightChild: LogicNode) : BinaryOp(leftChild, rightChild) {

    /**
     * Recursively applies Tseytin transformation on a logic node
     * Adds generated CNF snippets to a given ClauseSet
     * CNF snippets based on http://gauss.ececs.uc.edu/Courses/c626/lectures/BDD/st.pdf
     * @param cs ClauseSet to add generated clauses to
     * @param index ID of the current node in the logic tree (pre-order numbering)
     * @return ID of the next logic tree node (pre-order numbering)
     */
    override fun tseytin(cs: ClauseSet, index: Int): Int {
        var i = index
        val selfVar = getTseytinName(i)
        i += 1
        val leftChildVar = leftChild.getTseytinName(i)
        i = leftChild.tseytin(cs, i)
        val rightChildVar = rightChild.getTseytinName(i)
        i = rightChild.tseytin(cs, i)

        val clauseA = Clause(mutableListOf(Atom(leftChildVar, true), Atom(selfVar, false)))
        val clauseB = Clause(mutableListOf(Atom(rightChildVar, true), Atom(selfVar, false)))
        val clauseC = Clause(mutableListOf(Atom(leftChildVar, false), Atom(rightChildVar, false), Atom(selfVar, true)))
        cs.addAll(listOf(clauseA, clauseB, clauseC))

        return i
    }

    override fun getTseytinName(index: Int) = "or$index"

    override fun toString() = "($leftChild ∨ $rightChild)"

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class Impl(leftChild: LogicNode, rightChild: LogicNode) : BinaryOp(leftChild, rightChild) {

    /**
     * Translates arbitrary formulae into equivalent representations
     * using only basic operations (var, not, and, or)
     * @return representation of this LogicNode using only basic logic operations
     */
    override fun toBasicOps(): LogicNode {
        leftChild = leftChild.toBasicOps()
        rightChild = rightChild.toBasicOps()
        return Or(Not(leftChild), rightChild)
    }

    /**
     * Recursively applies Tseytin transformation on a logic node
     * Adds generated CNF snippets to a given ClauseSet
     * CNF snippets based on http://gauss.ececs.uc.edu/Courses/c626/lectures/BDD/st.pdf
     * @param cs ClauseSet to add generated clauses to
     * @param index ID of the current node in the logic tree (pre-order numbering)
     * @return ID of the next logic tree node (pre-order numbering)
     */
    override fun tseytin(cs: ClauseSet, index: Int): Int {
        var i = index
        val selfVar = getTseytinName(i)
        i += 1
        val leftChildVar = leftChild.getTseytinName(i)
        i = leftChild.tseytin(cs, i)
        val rightChildVar = rightChild.getTseytinName(i)
        i = rightChild.tseytin(cs, i)

        val clauseA = Clause(mutableListOf(Atom(leftChildVar, false), Atom(selfVar, false)))
        val clauseB = Clause(mutableListOf(Atom(rightChildVar, true), Atom(selfVar, false)))
        val clauseC = Clause(mutableListOf(Atom(leftChildVar, true), Atom(rightChildVar, false), Atom(selfVar, true)))
        cs.addAll(listOf(clauseA, clauseB, clauseC))

        return i
    }

    override fun getTseytinName(index: Int) = "impl$index"

    override fun toString() = "($leftChild --> $rightChild)"

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class Equiv(leftChild: LogicNode, rightChild: LogicNode) : BinaryOp(leftChild, rightChild) {

    /**
     * Translates arbitrary formulae into equivalent representations
     * using only basic operations (var, not, and, or)
     * @return representation of this LogicNode using only basic logic operations
     */
    override fun toBasicOps(): LogicNode {
        leftChild = leftChild.toBasicOps()
        rightChild = rightChild.toBasicOps()
        return Or(And(leftChild, rightChild), And(Not(leftChild), Not(rightChild)))
    }

    /**
     * Recursively applies Tseytin transformation on a logic node
     * Adds generated CNF snippets to a given ClauseSet
     * CNF snippets based on http://gauss.ececs.uc.edu/Courses/c626/lectures/BDD/st.pdf
     * @param cs ClauseSet to add generated clauses to
     * @param index ID of the current node in the logic tree (pre-order numbering)
     * @return ID of the next logic tree node (pre-order numbering)
     */
    override fun tseytin(cs: ClauseSet, index: Int): Int {
        var i = index
        val selfVar = getTseytinName(i)
        i += 1
        val leftChildVar = leftChild.getTseytinName(i)
        i = leftChild.tseytin(cs, i)
        val rightChildVar = rightChild.getTseytinName(i)
        i = rightChild.tseytin(cs, i)

        val clauseA = Clause(mutableListOf(Atom(leftChildVar, false), Atom(rightChildVar, true), Atom(selfVar, true)))
        val clauseB = Clause(mutableListOf(Atom(leftChildVar, true), Atom(rightChildVar, false), Atom(selfVar, true)))
        val clauseC = Clause(mutableListOf(Atom(leftChildVar, true), Atom(rightChildVar, true), Atom(selfVar, false)))
        val clauseD = Clause(mutableListOf(Atom(leftChildVar, false), Atom(rightChildVar, false), Atom(selfVar, false)))
        cs.addAll(listOf(clauseA, clauseB, clauseC, clauseD))

        return i
    }

    override fun getTseytinName(index: Int) = "equiv$index"

    override fun toString() = "($leftChild <=> $rightChild)"

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class Relation(val spelling: String, val arguments: List<FirstOrderTerm>) : LogicNode() {
    override fun toBasicOps() = this

    override fun getTseytinName(index: Int) = "rel$this"
    override fun tseytin(cs: ClauseSet, index: Int) = index + 1

    override fun toString() = "$spelling(${arguments.joinToString(", ")})"

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class UniversalQuantifier(val varName: String, child: LogicNode, val boundVariables: List<QuantifiedVariable>) : UnaryOp(child) {
    override fun tseytin(cs: ClauseSet, index: Int) = throw FormulaConversionException("CNF conversion applied on universal quantifier")
    override fun getTseytinName(index: Int) = "forall$index"

    override fun toString() = "(∀$varName: $child)"

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class ExistentialQuantifier(val varName: String, child: LogicNode, val boundVariables: List<QuantifiedVariable>) : UnaryOp(child) {
    override fun tseytin(cs: ClauseSet, index: Int) = throw FormulaConversionException("CNF conversion applied on existential quantifier")
    override fun getTseytinName(index: Int) = "exists$index"

    override fun toString() = "(∃$varName: $child)"

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}
