package kalkulierbar.nonclausaltableaux

import kalkulierbar.logic.LogicNode
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable
import kalkulierbar.logic.transform.Signature
import kalkulierbar.tree.GenericTreeNode
import kalkulierbar.tree.TreeGardener

@Serializable
class NcTableauxState(
    val formula: LogicNode,
    val backtracking: Boolean = true
) : ProtectedState(), TreeGardener<NcTableauxNode> {
    override val tree = mutableListOf(NcTableauxNode(null, formula.clone()))
    val moveHistory = mutableListOf<NcTableauxMove>()
    val identifiers = Signature.of(formula).getConstantsAndFunctionNames().toMutableSet()
    var usedBacktracking = false
    var gammaSuffixCounter = 0
    var skolemCounter = 0
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

        // Set isClosed for all descendants of the node
        val worklist = mutableListOf(nodeID)
        while (worklist.isNotEmpty()) {
            val elem = tree[worklist.removeAt(0)]
            worklist.addAll(elem.children)
            elem.isClosed = true
        }
    }

    fun render() {
        tree.forEach {
            it.render()
        }
    }

    override fun getHash(): String {
        val nodeH = tree.joinToString(",") { it.getHash() }
        val historyH = moveHistory.joinToString(",")
        val identifiersH = identifiers.joinToString(",")
        val variousH = "$backtracking|$usedBacktracking|$gammaSuffixCounter|$skolemCounter|$formula"
        return "nctableaux|$variousH|$identifiersH|$nodeH|$historyH"
    }
}

@Serializable
class NcTableauxNode(
    override var parent: Int?,
    var formula: LogicNode
) : GenericTreeNode {

    var isClosed = false
    var closeRef: Int? = null
    override val children = mutableListOf<Int>()
    var spelling = formula.toString()
    override val isLeaf
        get() = children.size == 0

    override fun toString() = formula.toString()

    fun render() {
        spelling = formula.toString()
    }

    fun getHash() = "($parent|$children|$isClosed|$closeRef|$formula)"
}
