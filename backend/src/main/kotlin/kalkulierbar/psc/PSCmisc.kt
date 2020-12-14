package kalkulierbar.psc

import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.transform.IdentifierCollector
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable

@Serializable
class PSCState(
) {
    val tree = mutableListOf<TreeNode>();

    constructor(formula: LogicNode) : this() {
        val leftFormula = mutableListOf<LogicNode>();
        var rightFormula = mutableListOf<LogicNode>();
        rightFormula.add(formula)
        tree.add(TreeNode(null, null, null, leftFormula, rightFormula))
    }
}

@Serializable
class TreeNode(var parent: Int?, val leftChild: Int?, val rightChild: Int?, val leftFormula: MutableList<LogicNode>, val rightFormula: MutableList<LogicNode>) {
    val isLeaf
        get() = leftChild == null

    override fun toString() = leftFormula.toString() + " ==> " + rightFormula.toString()
}

@Serializable
class PSCNode(
        var parent: Int?,
        var formula: LogicNode
) {

    var isClosed = false
    var closeRef: Int? = null
    val children = mutableListOf<Int>()
    var spelling = formula.toString()
    val isLeaf
        get() = children.size == 0

    override fun toString() = formula.toString()

    fun render() {
        spelling = formula.toString()
    }

    fun getHash() = "($parent|$children|$isClosed|$closeRef|$formula)"
}
