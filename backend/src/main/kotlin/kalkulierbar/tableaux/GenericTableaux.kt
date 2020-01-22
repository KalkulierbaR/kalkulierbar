package kalkulierbar.tableaux

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.clause.Atom
import kalkulierbar.clause.ClauseSet

interface GenericTableaux<AtomType> {
    fun setNodeClosed(state: GenericTableauxState<AtomType>, leaf: GenericTableauxNode<AtomType>) {
        var node = leaf

        // Set isClosed to true for all nodes dominated by leaf in reverse tree
        while (node.isLeaf || node.children.fold(true) { acc, e -> acc && state.nodes[e].isClosed }) {
            node.isClosed = true
            if (node.parent == null)
                break
            node = state.nodes[node.parent!!]
        }
    }

    @Suppress("ThrowsCount")
    fun ensureExpandability(state: GenericTableauxState<AtomType>, leafID: Int, clauseID: Int) {
        // Don't allow further expand moves if connectedness requires close moves to be applied first
        if (!checkConnectedness(state, state.type))
            throw IllegalMove("The proof tree is currently not sufficiently connected, " +
                    "please close branches first to restore connectedness before expanding more leaves")

        // Verify that both leaf and clause are valid
        if (leafID >= state.nodes.size || leafID < 0)
            throw IllegalMove("Node with ID $leafID does not exist")
        if (clauseID >= state.clauseSet.clauses.size || clauseID < 0)
            throw IllegalMove("Clause with ID $clauseID does not exist")

        val leaf = state.nodes[leafID]
        val clause = state.clauseSet.clauses[clauseID]

        // Verify that leaf is actually a leaf
        if (!leaf.isLeaf)
            throw IllegalMove("Node '$leaf' is not a leaf")

        if (leaf.isClosed)
            throw IllegalMove("Node '$leaf' is already closed")

        // Move should be compatible with regularity restriction
        if (state.regular)
            verifyExpandRegularity(state, leafID, clause)
    }

    @Suppress("ComplexMethod", "ThrowsCount")
    fun ensureBasicCloseability(state: GenericTableauxState<AtomType>, leafID: Int, closeNodeID: Int) {
        // Verify that both leaf and closeNode are valid nodes
        if (leafID >= state.nodes.size || leafID < 0)
            throw IllegalMove("Node with ID $leafID does not exist")
        if (closeNodeID >= state.nodes.size || closeNodeID < 0)
            throw IllegalMove("Node with ID $closeNodeID does not exist")

        val leaf = state.nodes[leafID]
        val closeNode = state.nodes[closeNodeID]

        // Verify that leaf is actually a leaf
        if (!leaf.isLeaf)
            throw IllegalMove("Node '$leaf' is not a leaf")

        // Verify that leaf is not already closed
        if (leaf.isClosed)
            throw IllegalMove("Leaf '$leaf' is already closed, no need to close again")

        // Verify that leaf and closeNode reference the same literal
        if (leaf.literalStem != closeNode.literalStem)
            throw IllegalMove("Leaf '$leaf' and node '$closeNode' do not reference the same literal")

        // Verify that negation checks out
        if (leaf.negated == closeNode.negated) {
            val noneOrBoth = if (leaf.negated) "both of them" else "neither of them"
            val msg = "Leaf '$leaf' and node '$closeNode' reference the same literal, but $noneOrBoth are negated"
            throw IllegalMove(msg)
        }

        // Ensure that tree root node cannot be used to close literals of same spelling ('true')
        if (closeNodeID == 0)
            throw IllegalMove("The root node cannot be used for branch closure")

        // Verify that closeNode is transitive parent of leaf
        if (!state.nodeIsParentOf(closeNodeID, leafID))
            throw IllegalMove("Node '$closeNode' is not an ancestor of leaf '$leaf'")
    }

    fun getCloseMessage(state: GenericTableauxState<AtomType>): CloseMessage {
        var msg = "The proof tree is not closed"

        if (state.root.isClosed) {
            var connectedness = "unconnected"
            if (checkConnectedness(state, TableauxType.STRONGLYCONNECTED))
                connectedness = "strongly connected"
            else if (checkConnectedness(state, TableauxType.WEAKLYCONNECTED))
                connectedness = "weakly connected"

            val regularity = if (checkRegularity(state)) "regular " else ""
            val withWithoutBT = if (state.usedBacktracking) "with" else "without"

            msg = "The proof is closed and valid in a $connectedness ${regularity}tableaux $withWithoutBT backtracking"
        }

        return CloseMessage(state.root.isClosed, msg)
    }
}

interface GenericTableauxState<AtomType> {
    val type: TableauxType
    val regular: Boolean
    val backtracking: Boolean
    val usedBacktracking: Boolean

    val clauseSet: ClauseSet<AtomType>
    val nodes: List<GenericTableauxNode<AtomType>>
    val root
        get() = nodes[0]
    val leaves
        get() = nodes.filter { it.isLeaf }

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
        return nodeIsParentOf(parentID, child.parent!!)
    }

    fun nodeIsCloseable(nodeID: Int): Boolean

    fun nodeIsDirectlyCloseable(nodeID: Int): Boolean
}

interface GenericTableauxNode<AtomType> {
    val parent: Int?
    val spelling: String
    val literalStem: String
    val negated: Boolean
    var isClosed: Boolean
    var closeRef: Int?
    val children: MutableList<Int>
    val isLeaf: Boolean

    fun toAtom(): Atom<AtomType>
}
