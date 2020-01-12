package kalkulierbar.logic.transform

import kalkulierbar.logic.And
import kalkulierbar.logic.Equiv
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.Impl
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier
import kalkulierbar.logic.Var

abstract class DoNothingVisitor : LogicNodeVisitor<LogicNode>() {

    override fun visit(node: And): LogicNode {
        node.leftChild = node.leftChild.accept(this)
        node.rightChild = node.rightChild.accept(this)
        return node
    }

    override fun visit(node: Equiv): LogicNode {
        node.leftChild = node.leftChild.accept(this)
        node.rightChild = node.rightChild.accept(this)
        return node
    }

    override fun visit(node: Impl): LogicNode {
        node.leftChild = node.leftChild.accept(this)
        node.rightChild = node.rightChild.accept(this)
        return node
    }

    override fun visit(node: Not): LogicNode {
        node.child = node.child.accept(this)
        return node
    }

    override fun visit(node: Or): LogicNode {
        node.leftChild = node.leftChild.accept(this)
        node.rightChild = node.rightChild.accept(this)
        return node
    }

    override fun visit(node: Var): LogicNode {
        return node
    }

    override fun visit(node: Relation): LogicNode {
        return node
    }

    override fun visit(node: UniversalQuantifier): LogicNode {
        node.child = node.child.accept(this)
        return node
    }

    override fun visit(node: ExistentialQuantifier): LogicNode {
        node.child = node.child.accept(this)
        return node
    }
}
