package kalkulierbar.sequentCalculus

import kalkulierbar.logic.LogicNode
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName


interface GenericSequentCalculus

interface GenericSequentCalculusState {
    val tree: MutableList<GenericSequentCalculusNode>

    fun setNodeClosed(leaf: GenericSequentCalculusNode) {
        var node = leaf;
        while (node.isLeaf || node.children.fold(true) { acc, elem -> acc && tree[elem].isClosed }) {
            node.isClosed = true;
            if (node.parent == null) {
                break;
            }
            node = tree.get(node.parent!!);
        }
    }
}

val GenericSequentCalculusNodeModule = SerializersModule {
    polymorphic(GenericSequentCalculusNode::class) {
        TreeNode::class with TreeNode.serializer()
    }
}

interface GenericSequentCalculusNode {
    val parent: Int?;
    var children: Array<Int>;
    val leftFormulas: MutableList<LogicNode>;
    val rightFormulas: MutableList<LogicNode>;
    var isClosed: Boolean;
    val lastMove: SequentCalculusMove?;

    val isLeaf
        get() = children.size == 0;

    override fun toString(): String

}

@Serializable
@SerialName("TreeNode")
class TreeNode(
    override val parent: Int?,
    override var children: Array<Int>,
    override val leftFormulas: MutableList<LogicNode>,
    override val rightFormulas: MutableList<LogicNode>,
    override var isClosed: Boolean,
    override val lastMove: SequentCalculusMove?
    
) : GenericSequentCalculusNode {

    constructor(
        parent: Int,
        leftFormulas: MutableList<LogicNode>, 
        rightFormulas: MutableList<LogicNode>, 
        lastMove: SequentCalculusMove
    ) : this (parent, emptyArray<Int>(), leftFormulas, rightFormulas, false, lastMove)

    constructor(
        leftFormulas: MutableList<LogicNode>, 
        rightFormulas: MutableList<LogicNode>
    ) : this(null, emptyArray<Int>(), leftFormulas, rightFormulas, false, null) {

    }

    constructor(
        leftFormulas: MutableList<LogicNode>, 
        rightFormulas: MutableList<LogicNode>, 
        lastMove: SequentCalculusMove
    ) : this(null, emptyArray<Int>(), leftFormulas, rightFormulas, false, lastMove) {

    }

    override fun toString(): String {
        return leftFormulas.joinToString() + " |- " + rightFormulas.joinToString();
    }
}