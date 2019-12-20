package kalkulierbar.logic

import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet

abstract class PropositionalLogicNode {
    abstract fun toBasicOps(): PropositionalLogicNode
    abstract fun negationPushdown(): PropositionalLogicNode
    abstract fun convertNNFtoClauseSet(): ClauseSet

    fun naiveCNF(): ClauseSet {
        val nnf = this.negationPushdown()
        return nnf.convertNNFtoClauseSet()
    }
}

abstract class BinaryOp(var leftChild: PropositionalLogicNode, var rightChild: PropositionalLogicNode) : PropositionalLogicNode() {
    override fun toBasicOps(): PropositionalLogicNode {
        leftChild = leftChild.toBasicOps()
        rightChild = rightChild.toBasicOps()
        return this
    }

    override fun negationPushdown(): PropositionalLogicNode {
        leftChild = leftChild.negationPushdown()
        rightChild = rightChild.negationPushdown()
        return this
    }

    override fun toString(): String {
        return "( $leftChild bop $rightChild)"
    }
}

abstract class UnaryOp(var child: PropositionalLogicNode) : PropositionalLogicNode() {
    override fun toBasicOps(): PropositionalLogicNode {
        child = child.toBasicOps()
        return this
    }

    override fun negationPushdown(): PropositionalLogicNode {
        child = child.negationPushdown()
        return this
    }

    override fun toString(): String {
        return "(uop $child)"
    }
}

class Var(var spelling: String) : PropositionalLogicNode() {
    override fun toBasicOps() = this
    override fun negationPushdown() = this
    override fun toString() = spelling

    override fun convertNNFtoClauseSet(): ClauseSet {
        val atom = Atom(spelling, false)
        val clause = Clause(mutableListOf(atom))
        return ClauseSet(mutableListOf(clause))
    }
}

class Not(child: PropositionalLogicNode) : UnaryOp(child) {

    override fun negationPushdown(): PropositionalLogicNode {
        var res = this as PropositionalLogicNode

        when (child) {
            is Not -> {
                val childNot = child as Not
                // Eliminate double negation
                res = childNot.child.negationPushdown()
            }
            is Or -> {
                val childOr = child as Or
                // De-Morgan Or
                res = And(Not(childOr.leftChild), Not(childOr.rightChild)).negationPushdown()
            }
            is And -> {
                val childAnd = child as And
                // De-Morgan And
                res = Or(Not(childAnd.leftChild), Not(childAnd.rightChild)).negationPushdown()
            }
            is Impl -> {
                val childImpl = child as Impl
                // !(a->b) = !(!a v b) = a^!b
                res = And(childImpl.leftChild, Not(childImpl.rightChild)).negationPushdown()
            }
            is Equiv -> {
                val childEquiv = child as Equiv
                val implA = Impl(childEquiv.leftChild, childEquiv.rightChild)
                val implB = Impl(childEquiv.rightChild, childEquiv.leftChild)
                // Translate equivalence into implications
                res = Not(And(implA, implB)).negationPushdown()
            }
        }

        return res
    }

    override fun convertNNFtoClauseSet(): ClauseSet {
        if (!(this.child is Var))
            throw Exception("Child of Not isn't a Var - convertNNFtoClauseSet called on non-NNF formula?")

        val variable = this.child as Var
        val atom = Atom(variable.spelling, true)
        val clause = Clause(mutableListOf(atom))
        return ClauseSet(mutableListOf(clause))
    }

    override fun toString() = "!$child"
}

class And(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun convertNNFtoClauseSet(): ClauseSet {
        val leftClauses = leftChild.convertNNFtoClauseSet().clauses
        val rightClauses = rightChild.convertNNFtoClauseSet().clauses
        val cs = ClauseSet(leftClauses)
        cs.addAll(rightClauses)
        return cs
    }

    override fun toString() = "($leftChild ∧ $rightChild)"
}

class Or(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun convertNNFtoClauseSet(): ClauseSet {
        val leftClauses = leftChild.convertNNFtoClauseSet().clauses
        val rightClauses = rightChild.convertNNFtoClauseSet().clauses
        val cs = ClauseSet()

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

    override fun toString() = "($leftChild ∨ $rightChild)"
}

class Impl(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun toBasicOps(): PropositionalLogicNode {
        leftChild = leftChild.toBasicOps()
        rightChild = rightChild.toBasicOps()
        return Or(Not(leftChild), rightChild)
    }

    override fun convertNNFtoClauseSet() = this.toBasicOps().convertNNFtoClauseSet()

    override fun toString() = "($leftChild --> $rightChild)"
}

class Equiv(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun toBasicOps(): PropositionalLogicNode {
        leftChild = leftChild.toBasicOps()
        rightChild = rightChild.toBasicOps()
        return Or(And(leftChild, rightChild), And(Not(leftChild), Not(rightChild)))
    }

    override fun convertNNFtoClauseSet() = this.toBasicOps().convertNNFtoClauseSet()

    override fun toString() = "($leftChild <=> $rightChild)"
}
