package kalkulierbar.sequentCalculus

import kalkulierbar.Statistic
import kalkulierbar.logic.LogicNode
import kotlin.math.max
import kotlin.math.sqrt
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule

interface GenericSequentCalculus

interface GenericSequentCalculusState {
    val tree: MutableList<GenericSequentCalculusNode>
    var showOnlyApplicableRules: Boolean

    /**
     * Closes the branch specified by the leaf is its closeable
     * @param leaf the leaf to closeS
     */
    fun setNodeClosed(leaf: GenericSequentCalculusNode) {
        var node = leaf
        while (node.isLeaf || node.children.fold(true) { acc, elem -> acc && tree[elem].isClosed }) {
            node.isClosed = true
            if (node.parent == null) {
                break
            }
            node = tree.get(node.parent!!)
        }
    }

    /**
     * Returns the width of the tree specified by nodeID
     * @param nodeID the node id of the root
     * @return the width of the tree
     */
    fun getWidth(nodeID: Int): Int {
        val node = tree[nodeID]
        if (node.children.isEmpty()) {
            return 1
        }
        return node.children.fold(0) { acc: Int, elem: Int -> acc + getWidth(elem) }
    }

    /**
    * Returns the maxmimum depth of the tree specified by nodeID
    * @param nodeID the node id of the root
    * @return the width of the tree
    */
    fun getDepth(nodeID: Int): Int {
        val node = tree[nodeID]
        if (node.children.isEmpty()) {
            return 1
        }
        return node.children.fold(0) { acc: Int, elem: Int -> max(acc, getDepth(elem) + 1) }
        // return node.children.fold(0) { (elem1, elem2) -> max(elem1, getDepth(elem2) + 1) }   
    }
}

val GenericSequentCalculusNodeModule = SerializersModule {
    polymorphic(GenericSequentCalculusNode::class) {
        TreeNode::class with TreeNode.serializer()
    }
}

interface GenericSequentCalculusNode {
    var parent: Int?
    var children: Array<Int>
    val leftFormulas: MutableList<LogicNode>
    val rightFormulas: MutableList<LogicNode>
    var isClosed: Boolean
    val lastMove: SequentCalculusMove?

    val isLeaf
        get() = children.size == 0

    override fun toString(): String
}

@Serializable
@SerialName("TreeNode")
class TreeNode(
    override var parent: Int?,
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
    ) : this(null, emptyArray<Int>(), leftFormulas, rightFormulas, false, null)

    constructor(
        leftFormulas: MutableList<LogicNode>,
        rightFormulas: MutableList<LogicNode>,
        lastMove: SequentCalculusMove
    ) : this(null, emptyArray<Int>(), leftFormulas, rightFormulas, false, lastMove)

    override fun toString(): String {
        return leftFormulas.joinToString() + " ⊢ " + rightFormulas.joinToString()
    }
}

@Serializable
data class SequentCalculusParam(
    val showOnlyApplicableRules: Boolean
)

@Serializable
@SerialName("SequentCalculusStatistic")
class SequentCalculusStatistic(
    override var userName: String?,
    val nodeAmount: Int,
    val depth: Int,
    val width: Int,
    val usedStupidMode: Boolean
) : Statistic {

    constructor(state: GenericSequentCalculusState) : this(
        null,
        state.tree.size,
        state.getDepth(0),
        state.getWidth(0),
        state.showOnlyApplicableRules
    ) {
        score = calculateScore()
    }

    override var score: Int = calculateScore()

    @Suppress("MagicNumber")
    override fun calculateScore(): Int {
        var ret = ((1 / sqrt(nodeAmount.toDouble())) * 1000).toInt()
        if (usedStupidMode == true)
            ret = (ret * 0.9).toInt()
        return ret
    }

    override fun columnNames(): List<String> {
        return listOf("Name", "Number of Sequences", "Depth", "Branches", "Used Help", "Score")
    }
}
