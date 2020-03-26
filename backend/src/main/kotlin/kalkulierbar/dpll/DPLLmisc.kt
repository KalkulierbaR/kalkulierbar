package kalkulierbar.dpll

import kalkulierbar.clause.ClauseSet
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable

@Serializable
class DPLLState(val clauseSet: ClauseSet<String>) : ProtectedState() {
    val tree = mutableListOf<TreeNode>()

    /**
     * Remove all children of a node from the proof tree
     * This requires some index shifting magic due to the list representation
     * of the tree, but I figure it's still better than figuring out a way to
     * serialize doubly-linked trees and define IDs on that
     * @param id ID of the node whose children are to be pruned
     */
    fun pruneBranch(id: Int) {
        // Collect all transitive children of the node
        // (not deleting anything yet to keep index structures intact)
        val queue = mutableListOf<Int>()
        val toDelete = mutableListOf<Int>()
        queue.addAll(tree[id].children)

        while (queue.isNotEmpty()) {
            val index = queue.removeAt(0)
            val node = tree[index]
            queue.addAll(node.children)
            toDelete.add(index)
        }

        // Remove each identified child, keeping parent references but not children references
        // We remove items from the largest index to the smallest to keep the indices of the other
        // items in the list consistent
        toDelete.sorted().asReversed().forEach {
            removeNodeInconsistent(it)
        }

        // Re-compute children references
        rebuildChildRefs()
    }

    /**
     * Removes a node from the proof tree, keeping parent references intact
     * NOTE: This will most likely leave the children references in an INCONSISTENT state
     *       Use rebuildChildRefs() to ensure valid children references
     * @param id ID of the node to remove
     */
    private fun removeNodeInconsistent(id: Int) {
        tree.removeAt(id)
        tree.forEach {
            if (it.parent != null && it.parent!! > id)
                it.parent = it.parent!! - 1
        }
    }

    /**
     * Rebuilds children references in the entire proof tree from parent references
     */
    private fun rebuildChildRefs() {
        tree.forEach { it.children.clear() }

        for (i in tree.indices) {
            if (tree[i].parent != null)
                tree[tree[i].parent!!].children.add(i)
        }
    }

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
class TreeNode(var parent: Int?, val type: NodeType, var label: String, val diff: CsDiff) {
    val children = mutableListOf<Int>()
    val isLeaf
        get() = children.size == 0
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
