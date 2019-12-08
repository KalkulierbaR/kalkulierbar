package kalkulierbar.tableaux

import kalkulierbar.TamperProtect
import kalkulierbar.clause.ClauseSet
import kotlinx.serialization.Serializable

/**
 * Class representing a PropositionalTableaux proof
 * @param clauseSet The clause set to be proven unsatisfiable
 */
@Serializable
class TableauxState(val clauseSet: ClauseSet, val type: TableauxType = TableauxType.UNCONNECTED, val regular: Boolean = false) {
    val nodes = mutableListOf<TableauxNode>(TableauxNode(null, "true", false))
    val root
        get() = nodes.get(0)
    val leaves
        get() = nodes.filter { it.isLeaf }
    var seal = ""

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
     * Generate a checksum of the current state to detect state objects being
     * modified or corrupted while in transit
     * Call before exporting state
     */
    fun computeSeal() {
        val payload = getHash()
        seal = TamperProtect.seal(payload)
    }

    /**
     * Verify the state object checksum
     * Call after importing state
     * @return true iff the current seal is valid
     */
    fun verifySeal() = TamperProtect.verify(getHash(), seal)

    /**
     * Pack the state into a well-defined, unambiguous string representation
     * Used to calculate checksums over state objects as JSON representation
     * might differ slightly between clients, encodings, etc
     * @return Canonical state representation
     */
    fun getHash(): String {
        val nodesHash = nodes.map { it.getHash() }.joinToString("|")
        val clauseSetHash = clauseSet.toString()
        return "tableauxstate|$type|$regular|$clauseSetHash|[$nodesHash]"
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
}

/**
 * Class representing a rule application in a PropositionalTableaux
 * @param type 'c' for a branch close move, 'e' for an expand move
 * @param id1 ID of the leaf to apply the rule on
 * @param id2 For expand moves: ID of the clause to expand. For close moves: ID of the node to close with
 */
@Serializable
data class TableauxMove(val type: String, val id1: Int, val id2: Int)

enum class TableauxType {
    UNCONNECTED, WEAKLYCONNECTED, STRONGLYCONNECTED
}
