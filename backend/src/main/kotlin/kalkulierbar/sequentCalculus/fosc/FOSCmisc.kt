package kalkulierbar.sequentCalculus.fosc

import kalkulierbar.logic.LogicNode
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable
import kalkulierbar.sequentCalculus.GenericSequentCalculusState
import kalkulierbar.sequentCalculus.GenericSequentCalculusNode

import kalkulierbar.sequentCalculus.TreeNode

@Serializable
class FOSCState(
    override val tree: MutableList<GenericSequentCalculusNode> = mutableListOf<GenericSequentCalculusNode>()
) : GenericSequentCalculusState, ProtectedState() {

    constructor(formula: LogicNode) : this() {
        val leftFormulas = mutableListOf<LogicNode>();
        var rightFormulas = mutableListOf<LogicNode>();
        rightFormulas.add(formula)
        tree.add(TreeNode(leftFormulas, rightFormulas))
    }

    constructor(left: LogicNode, right: LogicNode) : this() {
        val leftFormulas = mutableListOf<LogicNode>();
        var rightFormulas = mutableListOf<LogicNode>();
        leftFormulas.add(left);
        rightFormulas.add(right);
        tree.add(TreeNode(leftFormulas, rightFormulas))
    }

    constructor(leftFormulas: MutableList<LogicNode>, rightFormulas: MutableList<LogicNode>) : this() {
        tree.add(TreeNode(leftFormulas.toMutableList(), rightFormulas.toMutableList()))
    }
    
    override var seal = ""

    override fun getHash(): String {
        return "fosc|${tree.map{it.toString()}}"
    }
}