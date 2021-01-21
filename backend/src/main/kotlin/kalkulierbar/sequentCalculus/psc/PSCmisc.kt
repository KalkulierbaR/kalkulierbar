package kalkulierbar.sequentCalculus.psc

import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.transform.IdentifierCollector
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName
import kotlinx.serialization.modules.SerializersModule
import kalkulierbar.sequentCalculus.GenericSequentCalculusState
import kalkulierbar.sequentCalculus.GenericSequentCalculusNode
import kalkulierbar.sequentCalculus.SequentCalculusMove

import kalkulierbar.sequentCalculus.TreeNode

@Serializable
class PSCState(
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
        // return "psc";
        return "psc|${tree.map{it.toString()}}"
    }
}

// val PSCTreeNodeModule = SerializersModule {
//     polymorphic(TreeNode::class) {
//         TreeNode::class with TreeNode.serializer()
//     }
// }

// @Serializable
// class TreeNode(
//     override val parent: Int?,
//     override var children: Array<Int>,
//     override val leftFormulas: MutableList<LogicNode>,
//     override val rightFormulas: MutableList<LogicNode>,
//     override var isClosed: Boolean,
//     override val lastMove: SequentCalculusMove?
    
// ) : GenericSequentCalculusNode {

//     constructor(
//         parent: Int,
//         leftFormulas: MutableList<LogicNode>, 
//         rightFormulas: MutableList<LogicNode>, 
//         lastMove: SequentCalculusMove
//     ) : this (parent, emptyArray<Int>(), leftFormulas, rightFormulas, false, lastMove)

//     constructor(
//         leftFormulas: MutableList<LogicNode>, 
//         rightFormulas: MutableList<LogicNode>
//     ) : this(null, emptyArray<Int>(), leftFormulas, rightFormulas, false, null) {

//     }

//     constructor(
//         leftFormulas: MutableList<LogicNode>, 
//         rightFormulas: MutableList<LogicNode>, 
//         lastMove: SequentCalculusMove
//     ) : this(null, emptyArray<Int>(), leftFormulas, rightFormulas, false, lastMove) {

//     }

//     override fun toString(): String {
//         return leftFormulas.joinToString() + " |- " + rightFormulas.joinToString();
//     }
// }
