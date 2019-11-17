package kalkulierbar.logic

interface PropositionalLogicNode {
    fun simplify(): PropositionalLogicNode
}

abstract class BinaryOp(var leftChild: PropositionalLogicNode, var rightChild: PropositionalLogicNode) : PropositionalLogicNode {
    override fun simplify(): PropositionalLogicNode {
        leftChild = leftChild.simplify()
        rightChild = rightChild.simplify()
        return this
    }

    override fun toString(): String {
        return "( $leftChild bop $rightChild)"
    }
}

abstract class UnaryOp(var child: PropositionalLogicNode) : PropositionalLogicNode {
    override fun simplify(): PropositionalLogicNode {
        child = child.simplify()
        return this
    }

    override fun toString(): String {
        return "(uop $child)"
    }
}

class Var(var spelling: String) : PropositionalLogicNode {
    override fun simplify() = this
    override fun toString() = spelling
}

class Not(child: PropositionalLogicNode) : UnaryOp(child) {
    override fun toString() = "!$child"
}

class And(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun toString() = "($leftChild ∧ $rightChild)"
}

class Or(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun toString() = "($leftChild ∨ $rightChild)"
}

class Impl(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun simplify(): PropositionalLogicNode {
        leftChild = leftChild.simplify()
        rightChild = rightChild.simplify()
        return Or(Not(leftChild), rightChild)
    }

    override fun toString() = "($leftChild --> $rightChild)"
}

class Equiv(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun simplify(): PropositionalLogicNode {
        leftChild = leftChild.simplify()
        rightChild = rightChild.simplify()
        return Or(And(leftChild, rightChild), And(Not(leftChild), Not(rightChild)))
    }

    override fun toString() = "($leftChild <=> $rightChild)"
}
