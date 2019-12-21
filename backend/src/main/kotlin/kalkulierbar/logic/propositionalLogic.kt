package kalkulierbar.logic

import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet

abstract class PropositionalLogicNode {
    abstract fun toBasicOps(): PropositionalLogicNode
    abstract fun naiveCNF(): ClauseSet
}

abstract class BinaryOp(var leftChild: PropositionalLogicNode, var rightChild: PropositionalLogicNode) : PropositionalLogicNode() {
    override fun toBasicOps(): PropositionalLogicNode {
        leftChild = leftChild.toBasicOps()
        rightChild = rightChild.toBasicOps()
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

    override fun toString(): String {
        return "(uop $child)"
    }
}

class Var(var spelling: String) : PropositionalLogicNode() {
    override fun toBasicOps() = this
    override fun toString() = spelling

    override fun naiveCNF(): ClauseSet {
        val atom = Atom(spelling, false)
        val clause = Clause(mutableListOf(atom))
        return ClauseSet(mutableListOf(clause))
    }
}

class Not(child: PropositionalLogicNode) : UnaryOp(child) {

    override fun naiveCNF(): ClauseSet {
        val res: ClauseSet

        when (child) {
            is Not -> {
                val childNot = child as Not
                // Eliminate double negation
                res = childNot.child.naiveCNF()
            }
            is Or -> {
                val childOr = child as Or
                // De-Morgan Or
                res = And(Not(childOr.leftChild), Not(childOr.rightChild)).naiveCNF()
            }
            is And -> {
                val childAnd = child as And
                // De-Morgan And
                res = Or(Not(childAnd.leftChild), Not(childAnd.rightChild)).naiveCNF()
            }
            is Impl -> {
                val childImpl = child as Impl
                // !(a->b) = !(!a v b) = a^!b
                res = And(childImpl.leftChild, Not(childImpl.rightChild)).naiveCNF()
            }
            is Equiv -> {
                val childEquiv = child as Equiv
                val implA = Impl(childEquiv.leftChild, childEquiv.rightChild)
                val implB = Impl(childEquiv.rightChild, childEquiv.leftChild)
                // Translate equivalence into implications
                res = Not(And(implA, implB)).naiveCNF()
            }
            is Var -> {
                val childVar = child as Var
                val atom = Atom(childVar.spelling, true)
                val clause = Clause(mutableListOf(atom))
                return ClauseSet(mutableListOf(clause))
            }
            else -> throw Exception("Unknown PropositionalLogicNode encountered during naive CNF transformation")
        }

        return res
    }

    override fun toString() = "!$child"
}

class And(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun naiveCNF(): ClauseSet {
        val leftCS = leftChild.naiveCNF()
        val rightCS = rightChild.naiveCNF()
        leftCS.unite(rightCS)
        return leftCS
    }

    override fun toString() = "($leftChild ∧ $rightChild)"
}

class Or(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun naiveCNF(): ClauseSet {
        val leftClauses = leftChild.naiveCNF().clauses
        val rightClauses = rightChild.naiveCNF().clauses
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

    override fun naiveCNF() = this.toBasicOps().naiveCNF()

    override fun toString() = "($leftChild --> $rightChild)"
}

class Equiv(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun toBasicOps(): PropositionalLogicNode {
        leftChild = leftChild.toBasicOps()
        rightChild = rightChild.toBasicOps()
        return Or(And(leftChild, rightChild), And(Not(leftChild), Not(rightChild)))
    }

    override fun naiveCNF() = this.toBasicOps().naiveCNF()

    override fun toString() = "($leftChild <=> $rightChild)"
}
