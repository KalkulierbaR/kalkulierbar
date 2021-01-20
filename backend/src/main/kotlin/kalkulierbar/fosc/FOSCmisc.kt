package kalkulierbar.fosc

import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.transform.IdentifierCollector
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName
import kotlinx.serialization.modules.SerializersModule

@Serializable
class FOSCState() : ProtectedState() {
    val tree = mutableListOf<TreeNode>();

    constructor(formula: LogicNode) : this() {
        val leftFormula = mutableListOf<LogicNode>();
        var rightFormula = mutableListOf<LogicNode>();
        rightFormula.add(formula)
        tree.add(Leaf(null, leftFormula, rightFormula))
    }

    constructor(left: LogicNode, right: LogicNode) : this() {
        val leftFormula = mutableListOf<LogicNode>();
        var rightFormula = mutableListOf<LogicNode>();
        leftFormula.add(left);
        rightFormula.add(right);
        tree.add(Leaf(null, leftFormula, rightFormula))
    }

    constructor(leftFormula: MutableList<LogicNode>, rightFormula: MutableList<LogicNode>) : this() {
        tree.add(Leaf(null, leftFormula.toMutableList(), rightFormula.toMutableList()))
    }
    
    override var seal = ""

    override fun getHash(): String {
        return "fosc|${tree.map{it.toString()}}"
    }
}

val FOSCTreeNodeModule = SerializersModule {
    polymorphic(TreeNode::class) {
        Leaf::class with Leaf.serializer()
        OneChildNode::class with OneChildNode.serializer()
        TwoChildNode::class with TwoChildNode.serializer()
    }
}

@Serializable
abstract class TreeNode(){
    abstract val parent: Int?
    abstract val leftFormula: MutableList<LogicNode>
    abstract val rightFormula: MutableList<LogicNode>
}

@Serializable
@SerialName("leaf")
class Leaf(override val parent: Int?, override val leftFormula: MutableList<LogicNode>, override val rightFormula: MutableList<LogicNode>) : TreeNode() {
    override fun toString(): String {
        return leftFormula.joinToString() + " |- " + rightFormula.joinToString()
    }
}

@Serializable
@SerialName("oneChildNode")
class OneChildNode(override val parent: Int?, val child: Int, override val leftFormula: MutableList<LogicNode>, override val rightFormula: MutableList<LogicNode>) : TreeNode() {
    override fun toString(): String {
        return leftFormula.joinToString() + " |- " + rightFormula.joinToString()
    }
}

@Serializable
@SerialName("twoChildNode")
class TwoChildNode(override val parent: Int?, val leftChild: Int, val rightChild: Int, override val leftFormula: MutableList<LogicNode>, override val rightFormula: MutableList<LogicNode>) : TreeNode() {
    override fun toString(): String {
        return leftFormula.joinToString() + " |- " + rightFormula.joinToString()
    }
}
