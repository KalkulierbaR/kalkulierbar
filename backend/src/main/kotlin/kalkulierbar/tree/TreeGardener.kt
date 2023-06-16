package kalkulierbar.tree

import kalkulierbar.IllegalMove

interface TreeGardener<Node : GenericTreeNode> {
    val tree: MutableList<Node>

    fun addChildren(parentID: Int, vararg children: Node) {
        val parent = tree[parentID]
        for (child in children) {
            tree.add(child)
            parent.children.add(tree.size - 1)
        }
    }

    fun checkNodeID(vararg ids: Int) {
        for (id in ids) {
            if (id < 0 || tree.size <= id)
                throw IllegalMove("Node with ID $id does not exist")
        }
    }

    /**
     * Check whether a node is a (transitive) parent of another node
     * @param parentID Node to check parenthood of
     * @param childID Child node of suspected parent
     * @return true iff the parentID is a true ancestor of the childID
     */
    @Suppress("ReturnCount")
    fun nodeIsParentOf(parentID: Int, childID: Int): Boolean {
        val child = tree[childID]
        if (child.parent == parentID)
            return true
        if (child.parent == 0 || child.parent == null)
            return false
        return nodeIsParentOf(parentID, child.parent!!)
    }

    /**
     * Overwrite parent reference for some nodes
     * @param children List of nodes to update
     * @param parent New parent reference
     */
    fun setParent(children: List<Int>, parent: Int) {
        children.forEach {
            tree[it].parent = parent
        }
    }

    /**
     * Collect leaves from below a given node in the tree
     * If the given node is a leaf, only its ID will be returned
     * @param parent ID of the common parent of all leaves
     * @return List of Leaf IDs
     */
    fun childLeavesOf(parent: Int): List<Int> {
        val worklist = mutableListOf(parent)
        val leaves = mutableListOf<Int>()

        while (worklist.isNotEmpty()) {
            val index = worklist.removeAt(0)
            val node = tree[index]
            worklist.addAll(node.children)
            if (node.isLeaf)
                leaves.add(index)
        }

        return leaves
    }

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
     * Returns the width of the tree specified by nodeID
     * @param nodeID the node id of the root
     * @return the width of the tree
     */
    fun getWidth(nodeID: Int): Int {
        val node = tree[nodeID]
        return if (node.children.isEmpty())
            1
        else
            node.children.sumOf { getWidth(it) }
    }

    /**
     * Returns the maximum depth of the tree specified by nodeID
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
