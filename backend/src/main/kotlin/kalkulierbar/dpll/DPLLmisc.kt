package kalkulierbar.dpll

import kalkulierbar.clause.ClauseSet
import kalkulierbar.tamperprotect.ProtectedState
import kalkulierbar.tree.GenericTreeNode
import kalkulierbar.tree.TreeGardener
import kotlinx.serialization.Serializable

@Serializable
class DPLLState(val clauseSet: ClauseSet<String>) : ProtectedState(), TreeGardener<TreeNode> {
    override val tree = mutableListOf<TreeNode>()

    /**
     * Applies the clause set deltas stored in the proof tree to 'check out'
     * the full clause set of a node in the tree
     * @param branch ID of the node/branch whose clause set should be computed
     * @return Full clause set associated with the given node
     */
    fun getClauseSet(branch: Int): ClauseSet<String> {
        var node = tree[branch]
        val diffs = mutableListOf<CsDiff>()
        var res = clauseSet

        while (node.parent != null) {
            diffs.add(node.diff)
            node = tree[node.parent!!]
        }

        diffs.asReversed().forEach {
            res = it.apply(res)
        }

        return res
    }

    override var seal = ""
    override fun getHash() = "pdpll|$clauseSet|${tree.map{it.getHash()}}"
}

@Serializable
class TreeNode(override var parent: Int?, val type: NodeType, var label: String, val diff: CsDiff) : GenericTreeNode {
    override val children = mutableListOf<Int>()
    override val isLeaf
        get() = children.isEmpty()
    val isAnnotation
        get() = (type == NodeType.MODEL || type == NodeType.CLOSED)
    var modelVerified: Boolean? = null

    fun getHash(): String {
        return "($parent|$children|$type|$label|$diff|$modelVerified)"
    }

    override fun toString() = label
}

enum class NodeType {
    ROOT, PROP, SPLIT, MODEL, CLOSED
}
