package kalkulierbar.sequent

import kalkulierbar.logic.LogicNode
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import main.kotlin.kalkulierbar.tree.GenericTreeNode
import main.kotlin.kalkulierbar.tree.TreeGardener
import kotlin.math.sqrt

interface GenericSequentCalculus {
    @Suppress("MagicNumber")
    fun stateToStat(state: GenericSequentCalculusState, name: String?): Map<String, String> {
        val multiplier = if (state.showOnlyApplicableRules) 0.9 else 1.0
        val score = multiplier * (1 / sqrt(state.tree.size.toDouble())) * 1000
        return mapOf(
            "Name" to (name ?: ""),
            "#sequences" to state.tree.size.toString(),
            "Depth" to state.getDepth(0).toString(),
            "Branches" to state.getWidth(0).toString(),
            "Used Help" to if (state.showOnlyApplicableRules) "yes" else "no",
            "Score" to score.toInt().toString(),
        )
    }
}

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
