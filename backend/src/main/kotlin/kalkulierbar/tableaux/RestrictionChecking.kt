package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause

/**
 * Check if expanding a leaf violates regularity
 * Throws an explaining exception if the move violates regularity
 * @param state current state object
 * @param leafID ID of the leaf to be expanded
 * @param clause Clause object to be used for expansion
 */
fun verifyExpandRegularity(state: TableauxState, leafID: Int, clause: Clause) {
    // Create list of predecessor
    val leaf = state.nodes[leafID]
    var lst = mutableListOf<String>(leaf.toAtom().toString())

    // Check Leaf for having parent
    var predecessor: TableauxNode? = null
    if (leaf.parent != null)
        predecessor = state.nodes[leaf.parent]

    // Fill list of predecessor
    while (predecessor != null && predecessor.parent != null) {
        lst.add(predecessor.toAtom().toString())
        predecessor = state.nodes[predecessor.parent!!]
    }

    for (atom in clause.atoms) {
        // check if similar predecessor exists
        val isPathRegular = !lst.contains(atom.toString())

        if (!isPathRegular)
            throw IllegalMove("Expanding this clause would introduce a duplicate node '$atom' on the branch, making the tree irregular")
    }
}

/**
 * Check if expanding a leaf violates connectedness
 * Throws an explaining exception if the move violates the selected connectedness level
 * @param state current state object with the expansion already applied
 * @param leafID ID of the expanded leaf
 */
fun verifyExpandConnectedness(state: TableauxState, leafID: Int) {
    val leaf = state.nodes.get(leafID)
    val children = leaf.children

    // Expansion on root does not need to fulfill connectedness
    if (leafID == 0)
        return

    if (state.type == TableauxType.WEAKLYCONNECTED) {
        if (!children.fold(false) { acc, id -> acc || state.nodeIsCloseable(id) })
            throw IllegalMove("No literal in this clause would be closeable, making the tree unconnected")
    } else if (state.type == TableauxType.STRONGLYCONNECTED) {
        if (!children.fold(false) { acc, id -> acc || state.nodeIsDirectlyCloseable(id) })
            throw IllegalMove("No literal in this clause would be closeable with '$leaf', making the tree not strongly connected")
    }
}

/**
 * Verifies that a proof tree is weakly/strongly connected
 *
 * This method will return false even if the current tree can be transformed
 * into a weakly connected tree by applying close moves
 * @param state state object to check for connectedness
 * @param ctype type of connectedness to check for
 * @return true iff the proof tree is strongly/weakly connected
 */
fun checkConnectedness(state: TableauxState, ctype: TableauxType): Boolean {
    val startNodes = state.root.children // root is excluded from connectedness criteria

    if (ctype == TableauxType.UNCONNECTED)
        return true

    val strong = (ctype == TableauxType.STRONGLYCONNECTED)
    return startNodes.fold(true) { acc, id -> acc && checkConnectedSubtree(state, id, strong) }
}

/**
 * Verifies that a subtree proof tree is weakly/strongly connected
 *
 * This method does NOT exclude the root from the connectedness criteria
 * therefore it should not be used on the global proof tree root directly
 *
 * This method will return false even if the current tree can be transformed
 * into a weakly/strongly connected tree by applying close moves
 * @param state state object to check for connectedness
 * @param root ID of the node whose subtree should be checked
 * @param strong true for strong connectedness, false for weak connectedness
 * @return true iff the proof tree is weakly/strongly connected
 */
fun checkConnectedSubtree(state: TableauxState, root: Int, strong: Boolean): Boolean {
    val node = state.nodes.get(root)

    // A subtree is weakly/strongly connected iff:
    // 1. The root is a leaf OR at least one child of the root is a closed leaf
    // 1a. For strong connectedness: The closed child is closed with the root
    // 2. All child-subtrees are weakly/strongly connected themselves

    // Leaves are trivially connected
    if (node.isLeaf)
        return true

    var hasDirectlyClosedChild = false
    var allChildrenConnected = true

    for (id in node.children) {
        val child = state.nodes.get(id)

        val closedCondition = child.isClosed && (!strong || child.closeRef == root)

        if (child.isLeaf && closedCondition)
            hasDirectlyClosedChild = true
        // All children are connected themselves
        if (!checkConnectedSubtree(state, id, strong)) {
            allChildrenConnected = false
            break
        }
    }

    return hasDirectlyClosedChild && allChildrenConnected
}

/**
 * Verifies that no path in the proof tree has double variables
 * (i.e. the proof tree is regular)
 *
 * @param state state object to check for regularity
 * @return true iff the proof tree is regular
 */
fun checkRegularity(state: TableauxState): Boolean {
    val startNodes = state.root.children // root is excluded from connectedness criteria

    return startNodes.fold(true) { acc, id -> acc && checkRegularitySubtree(state, id, mutableListOf<Atom>()) }
}

/**
 * Checks every path from root of a subtree to leaf for regularity
 *
 * @param state : state object to search in subtree
 * @param root : ID of the subtree node from which to check
 * @param lst : list of unique node names of predecessor
 * @return true iff every path from root node to a leaf is regular
 */
fun checkRegularitySubtree(state: TableauxState, root: Int, lst: MutableList<Atom>): Boolean {
    val node = state.nodes[root]

    // If node is in list of predecessors return false
    if (lst.contains(node.toAtom()))
        return false

    // Add node spelling to list of predecessors
    lst.add(node.toAtom())

    // Check children for double vars in path and their children respectively
    for (id in node.children) {
        if (!checkRegularitySubtree(state, id, lst))
            return false
    }
    return true
}
