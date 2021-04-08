package kalkulierbar.signedtableaux

import kalkulierbar.Statistic
import kalkulierbar.logic.LogicNode
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import main.kotlin.kalkulierbar.tree.GenericTreeNode
import main.kotlin.kalkulierbar.tree.TreeGardener
import kotlin.math.sqrt

@Serializable
class SignedModalTableauxState(
    val formula: LogicNode,
    val assumption: Boolean,
    val backtracking: Boolean
) : ProtectedState(), TreeGardener<SignedModalTableauxNode> {
    override val tree = mutableListOf(SignedModalTableauxNode(null, listOf(1), assumption, formula.clone()))
    val moveHistory = mutableListOf<SignedModalTableauxMove>()
    var usedBacktracking = false

    var statusMessage: String? = null
    override var seal = ""

    /**
     * Marks a tree node and its ancestry as closed
     * NOTE: This does NOT set the closeRef of the closed node
     *       so make sure the closeRef is set before calling this
     * @param nodeID The node to mark as closed
     */
    fun setClosed(nodeID: Int) {
        var node = tree[nodeID]
        // Set isClosed to true for all nodes dominated by node in reverse tree
        while (node == tree[nodeID] || node.children.fold(true) { acc, e -> acc && tree[e].isClosed }) {
            node.isClosed = true
            if (node.parent == null)
                break
            node = tree[node.parent!!]
        }
        node = tree[nodeID]
        if (!node.isLeaf) {
            childLeavesOf(nodeID).forEach {
                setClosed(it)
            }
        }
    }

    /**
     * Checks if a prefix is already in use on the branch specified by the leaf
     * @param leafID the leafID that specifies the
     * @param prefix the prefix to be checked
     * @return whether the prefix is already in use
     */
    @Suppress("ReturnCount")
    fun prefixIsUsedOnBranch(leafID: Int, prefix: List<Int>): Boolean {
        var node = tree[leafID]
        if (prefix == node.prefix)
            return true
        while (node.parent != null) {
            node = tree[node.parent!!]
            if (prefix == node.prefix)
                return true
        }
        return false
    }

    fun render() {
        tree.forEach {
            it.render()
        }
    }

    override fun getHash(): String {
        val nodeH = tree.joinToString(",") { it.getHash() }
        val historyH = moveHistory.joinToString(",")
        val variousH = "$backtracking|$usedBacktracking|$formula"
        return "signed-modal-tableaux|$variousH|$nodeH|$historyH"
    }
}

@Serializable
class SignedModalTableauxNode(
    override var parent: Int?,
    var prefix: List<Int>,
    var sign: Boolean,
    var formula: LogicNode
) : GenericTreeNode {
    var isClosed = false
    var closeRef: Int? = null
    override val children = mutableListOf<Int>()
    var spelling = formula.toString()

    override fun toString() = "${prefix.joinToString(".")} $sign $formula"

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
