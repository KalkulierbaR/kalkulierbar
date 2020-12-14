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
class TreeNode(val parent: Int?, var leftChild: Int?, var rightChild: Int?, val leftFormula: MutableList<LogicNode>, val rightFormula: MutableList<LogicNode>) {
    fun isLeaf(): Boolean {
        return leftChild == null;
    }

    override fun toString() = leftFormula.toString() + " ==> " + rightFormula.toString()
}
