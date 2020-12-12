package kalkulierbar.psc

import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.transform.IdentifierCollector
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable

@Serializable
class PSCState(
        val formula: LogicNode,
        val backtracking: Boolean = true
) : ProtectedState() {
    val nodes = mutableListOf<PSCNode>(PSCNode(null, formula.clone()))
    val moveHistory = mutableListOf<PSCMove>()
    val identifiers = IdentifierCollector.collect(formula).toMutableSet()
    var usedBacktracking = false
    var gammaSuffixCounter = 0
    var skolemCounter = 0
    var statusMessage: String? = null

    override var seal = ""

    /**
     * Check whether a node is a (transitive) parent of another node
     * @param parentID Node to check parenthood of
     * @param childID Child node of suspected parent
     * @return true iff the parentID is a true ancestor of the childID
     */
    @Suppress("ReturnCount")
    fun nodeIsParentOf(parentID: Int, childID: Int): Boolean {
        val child = nodes[childID]
        if (child.parent == parentID)
            return true
        if (child.parent == 0 || child.parent == null)
            return false
        return nodeIsParentOf(parentID, child.parent!!)
    }

    /**
     * Marks a tree node and its ancestry as closed
     * NOTE: This does NOT set the closeRef of the closed node
     *       so make sure the closeRef is set before calling this
     * @param nodeID The node to mark as closed
     */
    fun setClosed(nodeID: Int) {
        var node = nodes[nodeID]
        // Set isClosed to true for all nodes dominated by node in reverse tree
        while (node == nodes[nodeID] || node.children.fold(true) { acc, e -> acc && nodes[e].isClosed }) {
            node.isClosed = true
            if (node.parent == null)
                break
            node = nodes[node.parent!!]
        }

        // Set isClosed for all descendants of the node
        val worklist = mutableListOf<Int>(nodeID)
        while (worklist.isNotEmpty()) {
            val elem = nodes[worklist.removeAt(0)]
            worklist.addAll(elem.children)
            elem.isClosed = true
        }
    }

    /**
     * Overwrite parent reference for some nodes
     * @param children List of nodes to update
     * @param parent New parent reference
     */
    fun setParent(children: List<Int>, parent: Int) {
        children.forEach {
            nodes[it].parent = parent
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
            val node = nodes[index]
            worklist.addAll(node.children)
            if (node.isLeaf)
                leaves.add(index)
        }

        return leaves
    }

    fun render() {
        nodes.forEach {
            it.render()
        }
    }

    override fun getHash(): String {
        val nodeH = nodes.joinToString(",") { it.getHash() }
        val historyH = moveHistory.joinToString(",")
        val identifiersH = identifiers.joinToString(",")
        val variousH = "$backtracking|$usedBacktracking|$gammaSuffixCounter|$skolemCounter|$formula"
        return "psc|$variousH|$identifiersH|$nodeH|$historyH"
    }
}

@Serializable
class PSCNode(
        var parent: Int?,
        var formula: LogicNode
) {

    var isClosed = false
    var closeRef: Int? = null
    val children = mutableListOf<Int>()
    var spelling = formula.toString()
    val isLeaf
        get() = children.size == 0

    override fun toString() = formula.toString()

    fun render() {
        spelling = formula.toString()
    }

    fun getHash() = "($parent|$children|$isClosed|$closeRef|$formula)"
}
