package kalkulierbar.tableaux

import kalkulierbar.IllegalMove

/**
 * Closes a branch in the proof tree is all relevant conditions are met
 * For rule specification see docs/PropositionalTableaux.md
 * @param state Current proof state
 * @param leafID Leaf node of the branch to be closed
 * @param closeNodeID Ancestor of the leaf to be used for closure
 * @return New state after rule was applied
 */
fun applyMoveCloseBranch(state: TableauxState, leafID: Int, closeNodeID: Int): TableauxState {
    ensureBasicCloseability(state, leafID, closeNodeID)

    val leaf = state.tree[leafID]

    // Close branch
    leaf.closeRef = closeNodeID
    state.setNodeClosed(leaf)

    // Add move to state history
    if (state.backtracking) {
        state.moveHistory.add(MoveAutoClose(leafID, closeNodeID))
    }

    return state
}

/**
 * Expand a leaf in the proof tree using a specified clause
 * For rule specification see docs/PropositionalTableaux.md
 * @param state Current proof state
 * @param leafID Leaf node to expand on
 * @param clauseID Clause to use for expansion
 * @return New state after rule was applied
 */
@Suppress("ThrowsCount")
fun applyMoveExpandLeaf(state: TableauxState, leafID: Int, clauseID: Int): TableauxState {
    ensureExpandability(state, leafID, clauseID)
    val clause = state.clauseSet.clauses[clauseID]
    val leaf = state.tree[leafID]

    // Adding every atom in clause to leaf and set parameters
    for (atom in clause.atoms) {
        val newLeaf = TableauxNode(leafID, atom.lit, atom.negated)
        state.tree.add(newLeaf)
        leaf.children.add(state.tree.size - 1)
    }

    // Verify compliance with connectedness criteria
    verifyExpandConnectedness(state, leafID)

    // Add move to state history
    if (state.backtracking) {
        state.moveHistory.add(MoveExpand(leafID, clauseID))
    }

    return state
}

/**
 * Appends the negation of a closed node on a leaf (lemma rule)
 * provided the chosen leaf is on a sibling-branch of the closed node
 * @param state Current proof state to apply the move on
 * @param leafID ID of the leaf to append the lemma to
 * @param lemmaID ID of the proof tree node to create a lemma from
 * @return new proof state with lemma applied
 */
fun applyMoveUseLemma(state: TableauxState, leafID: Int, lemmaID: Int): TableauxState {
    // Get lemma atom and verify all preconditions
    val atom = state.getLemma(leafID, lemmaID)

    // Add lemma atom to leaf
    val newLeaf = TableauxNode(leafID, atom.lit, atom.negated, lemmaID)
    state.tree.add(newLeaf)
    state.tree[leafID].children.add(state.tree.size - 1)

    // Verify compliance with connectedness criteria
    verifyExpandConnectedness(state, leafID)

    // Add move to state history
    if (state.backtracking) {
        state.moveHistory.add(MoveLemma(leafID, lemmaID))
    }

    return state
}

/**
 *  Undo the last executed move
 *  @param state Current prove State
 *  @return New state after undoing last move
 */
@Suppress("ThrowsCount")
fun applyMoveUndo(state: TableauxState): TableauxState {
    if (!state.backtracking) {
        throw IllegalMove("Backtracking is not enabled for this proof")
    }
    // Throw error if no moves were made already
    val history = state.moveHistory
    if (history.isEmpty()) {
        throw IllegalMove("Can't undo in initial state")
    }
    // Retrieve and remove this undo from list
    val top = history.removeAt(state.moveHistory.size - 1)

    // Set usedUndo to true
    state.usedBacktracking = true

    // Pass undo move to relevant expand and close subfunction
    return when (top) {
        is MoveAutoClose -> undoClose(state, top)
        is MoveExpand -> undoExpand(state, top)
        is MoveLemma -> undoLemma(state, top)
        else -> throw IllegalMove("Something went wrong. Move not implemented!")
    }
}

/**
 *  Undo close move
 *  @param state Current prove State
 *  @param move The last move executed
 *  @return New state after undoing latest close move
 */
private fun undoClose(state: TableauxState, move: MoveAutoClose): TableauxState {
    val leafID = move.id1
    val leaf = state.tree[leafID]

    // revert close reference to null
    leaf.closeRef = null

    var node: TableauxNode? = leaf

    while (node != null && node.isClosed) {
        node.isClosed = false
        node = if (node.parent == null) null else state.tree[node.parent!!]
    }

    return state
}

/**
 *  Undo expand move
 *  @param state Current prove State
 *  @param move The last move executed
 *  @return New state after undoing latest expand move
 */
private fun undoExpand(state: TableauxState, move: MoveExpand): TableauxState {
    val leafID = move.id1
    val leaf = state.tree[leafID]
    val children = leaf.children
    val nodes = state.tree

    // remove child nodes from nodes list
    for (id in children) {
        // nodes removed are always at the top of nodes list
        // when undoing the last expand move
        nodes.removeAt(nodes.size - 1)
    }

    // Remove all leaf-children
    leaf.children.clear()

    return state
}

// Undoing a lemma expansion is the same as undoing a regular expand move
private fun undoLemma(state: TableauxState, move: MoveLemma) = undoExpand(state, MoveExpand(move.id1, move.id2))
