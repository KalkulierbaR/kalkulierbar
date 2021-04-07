package kalkulierbar.sequent

import kalkulierbar.Statistic
import kalkulierbar.logic.LogicNode
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.polymorphic
import kotlinx.serialization.modules.subclass
import kotlin.math.sqrt

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
        while (node.isLeaf || node.children.all { tree[it].isClosed }) {
            node.isClosed = true
            if (node.parent == null) {
                break
            }
            node = tree[node.parent!!]
        }
    }

    /**
     * Returns the width of the tree specified by nodeID
     * @param nodeID the node id of the root
     * @return the width of the tree
     */
    fun getWidth(nodeID: Int): Int {
        val node = tree[nodeID]
        return if (node.children.isEmpty())
            1
        else
            node.children.sumBy { getWidth(it) }
    }

    /**
     * Returns the maxmimum depth of the tree specified by nodeID
     * @param nodeID the node id of the root
     * @return the width of the tree
     */
    fun getDepth(nodeID: Int): Int {
        val node = tree[nodeID]
        return if (node.children.isEmpty())
            1
        else
            node.children.maxByOrNull { getDepth(it) }!! + 1
    }
}

val GenericSequentCalculusNodeModule = SerializersModule {
    polymorphic(GenericSequentCalculusNode::class) {
        subclass(TreeNode::class)
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
        get() = children.isEmpty()

    override fun toString(): String
}

@Serializable
@SerialName("TreeNode")
@Suppress("LongParameterList")
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
    val usedGuidedMode: Boolean
) : Statistic {

    constructor(state: GenericSequentCalculusState) : this(
        null,
        state.tree.size,
        state.getDepth(0),
        state.getWidth(0),
        state.showOnlyApplicableRules
    )

    val score: Int = calculateScore()

    @Suppress("MagicNumber")
    fun calculateScore(): Int {
        var score = ((1 / sqrt(nodeAmount.toDouble())) * 1000).toInt()
        if (usedGuidedMode)
            score = (score * 0.9).toInt()
        return score
    }

    override fun columnNames(): List<String> {
        return listOf("Name", "Number of Sequences", "Depth", "Branches", "Used Help", "Score")
    }
}
