package kalkulierbar.sequent

import kalkulierbar.Statistic
import kalkulierbar.logic.LogicNode
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import main.kotlin.kalkulierbar.tree.GenericTreeNode
import main.kotlin.kalkulierbar.tree.TreeGardener
import kotlin.math.sqrt

interface GenericSequentCalculus

interface GenericSequentCalculusState : TreeGardener<TreeNode> {
    override val tree: MutableList<TreeNode>
    var showOnlyApplicableRules: Boolean

    /**
     * Closes the branch specified by the leaf is its closeable
     * @param leaf the leaf to closeS
     */
    fun setNodeClosed(leaf: TreeNode) {
        var node = leaf
        while (node.isLeaf || node.children.all { tree[it].isClosed }) {
            node.isClosed = true
            if (node.parent == null) {
                break
            }
            node = tree[node.parent!!]
        }
    }
}

@Serializable
@SerialName("TreeNode")
@Suppress("LongParameterList")
class TreeNode(
    override var parent: Int?,
    override var children: MutableList<Int>,
    val leftFormulas: MutableList<LogicNode>,
    val rightFormulas: MutableList<LogicNode>,
    var isClosed: Boolean,
    val lastMove: SequentCalculusMove?

) : GenericTreeNode {
    constructor(
        parent: Int,
        leftFormulas: MutableList<LogicNode>,
        rightFormulas: MutableList<LogicNode>,
        lastMove: SequentCalculusMove
    ) : this (parent, mutableListOf(), leftFormulas, rightFormulas, false, lastMove)

    constructor(
        leftFormulas: MutableList<LogicNode>,
        rightFormulas: MutableList<LogicNode>
    ) : this(null, mutableListOf(), leftFormulas, rightFormulas, false, null)

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
