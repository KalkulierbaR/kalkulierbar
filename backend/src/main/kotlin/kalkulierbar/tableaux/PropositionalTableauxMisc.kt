package kalkulierbar.tableaux

import kalkulierbar.clause.Atom
import kalkulierbar.clause.ClauseSet
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable

/**
 * Class representing a PropositionalTableaux proof
 * @param clauseSet The clause set to be proven unsatisfiable
 */
@Serializable
class TableauxState(
    val clauseSet: ClauseSet,
    val type: TableauxType = TableauxType.UNCONNECTED,
    val regular: Boolean = false,
    val undoEnable: Boolean = false
) : ProtectedState() {
    val nodes = mutableListOf<TableauxNode>(TableauxNode(null, "true", false))
    val moveHistory = mutableListOf<TableauxMove>()
    var usedUndo = false
    val root
        get() = nodes[0]
    val leaves
        get() = nodes.filter { it.isLeaf }
    override var seal = ""

    /**
     * Check whether a node is a (transitive) parent of another node
     * @param parentID Node to check parenthood of
     * @param childID Child node of suspected parent
     * @return true iff the parentID is a true ancestor of the childID
     */
    @Suppress("ReturnCount")
    fun nodeIsParentOf(parentID: Int, childID: Int): Boolean {
        val child = nodes.get(childID)
        if (child.parent == parentID)
            return true
        if (child.parent == 0 || child.parent == null)
            return false
        return nodeIsParentOf(parentID, child.parent)
    }

    /**
     * Check if a given node can be closed
     * @param nodeID ID of the node to check
     * @return true is the node can be closed, false otherwise
     */
    fun nodeIsCloseable(nodeID: Int): Boolean {
        val node = nodes.get(nodeID)
        return node.isLeaf && nodeAncestryContainsAtom(nodeID, node.toAtom().not())
    }

    /**
     * Check if a given node can be closed with its immediate parent
     * @param nodeID ID of the node to check
     * @return true is the node can be closed directly, false otherwise
     */
    fun nodeIsDirectlyCloseable(nodeID: Int): Boolean {
        val node = nodes[nodeID]
        if (node.parent == null)
            return false
        val parent = nodes[node.parent]

        return node.isLeaf && node.toAtom() == parent.toAtom().not()
    }

    /**
     * Check if a node's ancestry includes a specified atom
     * @param nodeID ID of the node to check
     * @param atom the atom to search for
     * @return true iff the node's transitive parents include the given atom
     */
    private fun nodeAncestryContainsAtom(nodeID: Int, atom: Atom): Boolean {
        var node = nodes[nodeID]

        // Walk up the tree from start node
        while (node.parent != null) {
            node = nodes[node.parent!!]
            // Check if current node is identical to atom
            if (node.toAtom() == atom)
                return true
        }

        return false
    }

    override fun getHash(): String {
        val nodesHash = nodes.joinToString("|") { it.getHash() }
        val clauseSetHash = clauseSet.toString()
        val optsHash = "$type|$regular|$undoEnable|$usedUndo"
        val historyHash = moveHistory.map { "(${it.type},${it.id1},${it.id2})" }.joinToString(",")
        return "tableauxstate|$optsHash|$clauseSetHash|[$nodesHash]|[$historyHash]"
    }
}

/**
 * Class representing a single node in the proof tree
 * @param parent ID of the parent node in the proof tree
 * @param spelling Name of the variable the node represents
 * @param negated True if the variable is negated, false otherwise
 */
@Serializable
class TableauxNode(val parent: Int?, val spelling: String, val negated: Boolean) {
    var isClosed = false
    var closeRef: Int? = null
    val children = mutableListOf<Int>()
    val isLeaf
        get() = children.size == 0

    override fun toString(): String {
        return if (negated) "!$spelling" else spelling
    }

    /**
     * Pack the node into a well-defined, unambiguous string representation
     * Used to calculate checksums over state objects as JSON representation
     * might differ slightly between clients, encodings, etc
     * @return Canonical node representation
     */
    fun getHash(): String {
        val neg = if (negated) "n" else "p"
        val leaf = if (isLeaf) "l" else "i"
        val closed = if (isClosed) "c" else "o"
        val ref = if (closeRef != null) closeRef.toString() else "-"
        val childlist = children.joinToString(",")
        return "$spelling;$neg;$parent;$ref;$leaf;$closed;($childlist)"
    }

    fun toAtom() = Atom(spelling, negated)
}

/**
 * Class representing a rule application in a PropositionalTableaux
 * @param type EXPAND for a branch expand move, CLOSE for a branch close move, UNDO for a undo move
 * @param id1 ID of the leaf to apply the rule on, For undo moves: ID of the leaf
 * @param id2 For expand moves: ID of the clause to expand. For close moves: ID of the node to close with
 */
@Serializable
data class TableauxMove(val type: MoveType, val id1: Int, val id2: Int)

/**
 * Class representing parameter settings for a regular tableaux
 * @param type minimum connectedness setting for the tableaux
 *      UNCONNECTED, WEAKLYCONNECTED or STRONGYLCONNECTED
 * @param regular set to true to enforce regularity
 */
@Serializable
data class TableauxParam(val type: TableauxType, val regular: Boolean, val backtracking: Boolean)

enum class TableauxType {
    UNCONNECTED, WEAKLYCONNECTED, STRONGLYCONNECTED
}

enum class MoveType {
    EXPAND, CLOSE, UNDO
}
