package kalkulierbar.signedtableaux

import kalkulierbar.Statistic
import kalkulierbar.logic.LogicNode
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlin.math.sqrt

@Serializable
class SignedModalTableauxState(
    val formula: LogicNode,
    val assumption: Boolean,
    val backtracking: Boolean
) : ProtectedState() {
    val nodes = mutableListOf(SignedModalTableauxNode(null, listOf(1), assumption, formula.clone()))
    val moveHistory = mutableListOf<SignedModalTableauxMove>()
    var usedBacktracking = false

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
        node = nodes[nodeID]
        if (!node.isLeaf) {
            childLeavesOf(nodeID).forEach {
                setClosed(it)
            }
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

    /**
     * Checks if a prefix is already in use on the branch specified by the leaf
     * @param leafID the leafID that specifies the
     * @param prefix the prefix to be checked
     * @return whether the prefix is already in use
     */
    @Suppress("ReturnCount")
    fun prefixIsUsedOnBranch(leafID: Int, prefix: List<Int>): Boolean {
        var node = nodes[leafID]
        if (prefix == node.prefix)
            return true
        while (node.parent != null) {
            node = nodes[node.parent!!]
            if (prefix == node.prefix)
                return true
        }
        return false
    }

    /**
     * Returns the width of the tree specified by nodeID
     * @param nodeID the node id of the root
     * @return the width of the tree
     */
    fun getWidth(nodeID: Int): Int {
        val node = nodes[nodeID]
        return if (node.children.isEmpty())
            1
        else
            node.children.sumBy { getWidth(it) }
    }

    /**
     * Returns the maximum depth of the tree specified by nodeID
     * @param nodeID the node id of the root
     * @return the width of the tree
     */
    fun getDepth(nodeID: Int): Int {
        val node = nodes[nodeID]
        return if (node.children.isEmpty())
            1
        else
            node.children.maxByOrNull { getDepth(it) }!! + 1
    }

    fun render() {
        nodes.forEach {
            it.render()
        }
    }

    override fun getHash(): String {
        val nodeH = nodes.joinToString(",") { it.getHash() }
        val historyH = moveHistory.joinToString(",")
        val variousH = "$backtracking|$usedBacktracking|$formula"
        return "signed-modal-tableaux|$variousH|$nodeH|$historyH"
    }
}

@Serializable
class SignedModalTableauxNode(
    var parent: Int?,
    var prefix: List<Int>,
    var sign: Boolean,
    var formula: LogicNode
) {
    var isClosed = false
    var closeRef: Int? = null
    val children = mutableListOf<Int>()
    var spelling = formula.toString()
    val isLeaf
        get() = children.size == 0

    override fun toString() = prefix.toString() + sign.toString() + formula.toString()

    fun render() {
        spelling = formula.toString()
    }

    fun getHash() = "($parent|$children|$isClosed|$closeRef|$formula)"
}

@Serializable
data class SignedModalTableauxParam(
    val backtracking: Boolean
)

@Serializable
@SerialName("signedModalTableauxStatistic")
class SignedModalTableauxStatistic(
    override var userName: String?,
    val numberOfMoves: Int,
    val depth: Int,
    val width: Int,
    val usedBacktracking: Boolean
) : Statistic {

    constructor(state: SignedModalTableauxState) : this(
        null,
        state.moveHistory.size,
        state.getDepth(0),
        state.getWidth(0),
        state.usedBacktracking
    )

    val score: Int = calculateScore()

    @Suppress("MagicNumber")
    fun calculateScore(): Int {
        var ret = ((1 / sqrt(numberOfMoves.toDouble())) * 1000).toInt()
        if (usedBacktracking) {
            ret = (ret * 0.9).toInt()
        }
        return ret
    }

    override fun columnNames(): List<String> {
        return listOf("Name", "Number of Rules", "Depth", "Branches", "Used backtracking", "Score")
    }
}
