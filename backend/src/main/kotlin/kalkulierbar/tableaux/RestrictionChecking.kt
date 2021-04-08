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
 * @param applyPreprocessing Whether to simulate expansion clause preprocessing or not
 */
fun <AtomType> verifyExpandRegularity(
    state: GenericTableauxState<AtomType>,
    leafID: Int,
    clause: Clause<AtomType>,
    applyPreprocessing: Boolean = true
) {
    // Create list of predecessor
    val leaf = state.nodes[leafID]
    val lst = mutableListOf(leaf.toAtom())

    // Check Leaf for having parent
    var predecessor: GenericTableauxNode<AtomType>? = null
    if (leaf.parent != null)
        predecessor = state.nodes[leaf.parent!!]

    // Fill list of predecessor
    while (predecessor?.parent != null) {
        lst.add(predecessor.toAtom())
        predecessor = state.nodes[predecessor.parent!!]
    }

    // Apply expand preprocessing unless specified otherwise
    val processedClause = if (applyPreprocessing) state.clauseExpandPreprocessing(clause) else clause.atoms

    for (atom in processedClause) {
        if (lst.contains(atom))
            throw IllegalMove(
                "Expanding this clause would introduce a duplicate " +
                    "node '$atom' on the branch, making the tree irregular"
            )
    }
}

/**
 * Check if expanding a leaf violates connectedness
 * Throws an explaining exception if the move violates the selected connectedness level
 * @param state current state object with the expansion already applied
 * @param leafID ID of the expanded leaf
 */
fun <AtomType> verifyExpandConnectedness(state: GenericTableauxState<AtomType>, leafID: Int) {
    val leaf = state.nodes[leafID]
    val children = leaf.children

    // Expansion on root does not need to fulfill connectedness
    if (leafID == 0)
        return

    if (state.type == TableauxType.WEAKLYCONNECTED) {
        if (!children.fold(false) { acc, id -> acc || state.nodeIsCloseable(id) })
            throw IllegalMove("No literal in this clause would be closeable, making the tree unconnected")
    } else if (state.type == TableauxType.STRONGLYCONNECTED) {
        if (!children.fold(false) { acc, id -> acc || state.nodeIsDirectlyCloseable(id) })
            throw IllegalMove(
                """No literal in this clause would be closeable with '$leaf',
                making the tree not strongly connected"""
            )
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
fun <AtomType> checkConnectedness(state: GenericTableauxState<AtomType>, ctype: TableauxType): Boolean {
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
private fun <AtomType> checkConnectedSubtree(
    state: GenericTableauxState<AtomType>,
    root: Int,
    strong: Boolean
): Boolean {
    val node = state.nodes[root]

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
        val child = state.nodes[id]

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
fun <AtomType> checkRegularity(state: GenericTableauxState<AtomType>): Boolean {
    val startNodes = state.root.children // root is excluded from connectedness criteria

    return startNodes.fold(true) { acc, id -> acc && checkRegularitySubtree(state, id, listOf()) }
}

/**
 * Checks every path from root of a subtree to leaf for regularity
 *
 * @param state : state object to search in subtree
 * @param root : ID of the subtree node from which to check
 * @param lst : list of unique node names of predecessor
 * @return true iff every path from root node to a leaf is regular
 */
private fun <AtomType> checkRegularitySubtree(
    state: GenericTableauxState<AtomType>,
    root: Int,
    lst: List<Atom<AtomType>>
): Boolean {
    val node = state.nodes[root]

    // If node is in list of predecessors return false
    if (lst.contains(node.toAtom()))
        return false

    // Add node spelling to list of predecessors
    val lstCopy = mutableListOf<Atom<AtomType>>()
    lstCopy.addAll(lst)
    lstCopy.add(node.toAtom())

    // Check children for double vars in path and their children respectively
    return node.children.none { !checkRegularitySubtree(state, it, lstCopy) }
}

/**
 * Ensure the basic sanity of an expand move application
 * If a condition is not met, an explaining exception will be thrown
 * Conditions include:
 *  - Both the specified leaf and clause exist
 *  - The specified leaf is a leaf and not already closed
 *  - Expanding the specified clause at the leaf would not violate regularity
 * @param state State the expansion is to be applied in
 * @param leafID The leaf to expand
 * @param clauseID The clause to expand at the leaf
 */
@Suppress("ThrowsCount")
fun <AtomType> ensureExpandability(state: GenericTableauxState<AtomType>, leafID: Int, clauseID: Int) {
    // Don't allow further expand moves if connectedness requires close moves to be applied first
    if (!checkConnectedness(state, state.type))
        throw IllegalMove(
            "The proof tree is currently not sufficiently connected, " +
                "please close branches first to restore connectedness before expanding more leaves"
        )

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

/**
 * Ensures that basic conditions for branch closure are met
 * If a condition is not met, an explaining exception will be thrown
 * Conditions inlcude:
 *  - Both nodes exist
 *  - The specified leaf is a leaf and not yet closed
 *  - Both nodes share the same literal stem (variable name or relation name)
 *  - The nodes are of opposite polarity
 *  - The closeNode is an ancestor of the leaf
 *
 * @param state State to apply close move in
 * @param leafID Leaf to close
 * @param closeNodeID Node to close with
 */
@Suppress("ComplexMethod", "ThrowsCount")
fun <AtomType> ensureBasicCloseability(state: GenericTableauxState<AtomType>, leafID: Int, closeNodeID: Int) {
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
