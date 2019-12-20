package kalkulierbar.logic

interface PropositionalLogicNode {
    fun toBasicOps(): PropositionalLogicNode
    fun negationPushdown(): PropositionalLogicNode
}

abstract class BinaryOp(var leftChild: PropositionalLogicNode, var rightChild: PropositionalLogicNode) : PropositionalLogicNode {
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

abstract class UnaryOp(var child: PropositionalLogicNode) : PropositionalLogicNode {
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

class Var(var spelling: String) : PropositionalLogicNode {
    override fun toBasicOps() = this
    override fun negationPushdown() = this
    override fun toString() = spelling
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

    override fun toString() = "!$child"
}

class And(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun toString() = "($leftChild ∧ $rightChild)"
}

class Or(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun toString() = "($leftChild ∨ $rightChild)"
}

class Impl(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun toBasicOps(): PropositionalLogicNode {
        leftChild = leftChild.toBasicOps()
        rightChild = rightChild.toBasicOps()
        return Or(Not(leftChild), rightChild)
    }

    override fun toString() = "($leftChild --> $rightChild)"
}

class Equiv(leftChild: PropositionalLogicNode, rightChild: PropositionalLogicNode) : BinaryOp(leftChild, rightChild) {
    override fun toBasicOps(): PropositionalLogicNode {
        leftChild = leftChild.toBasicOps()
        rightChild = rightChild.toBasicOps()
        return Or(And(leftChild, rightChild), And(Not(leftChild), Not(rightChild)))
    }

    override fun toString() = "($leftChild <=> $rightChild)"
}
