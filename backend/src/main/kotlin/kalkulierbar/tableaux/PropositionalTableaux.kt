package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.clause.Clause
import kalkulierbar.parsers.FlexibleClauseSetParser
import kotlinx.serialization.json.Json

/**
 * Implementation of a simple tableaux calculus on propositional clause sets
 * For calculus specification see docs/PropositionalTableaux.md
 */
@Suppress("TooManyFunctions")
class PropositionalTableaux : GenericTableaux<String>, JSONCalculus<TableauxState, TableauxMove, TableauxParam>() {

    override val identifier = "prop-tableaux"

    /**
     * Parses a provided clause set as text into an initial internal state
     * Resulting state object will have a root node labeled 'true' in its tree
     * @param formula propositional clause set, format a,!b;!c,d
     * @return parsed state object
     */
    override fun parseFormulaToState(formula: String, params: TableauxParam?): TableauxState {
        if (params == null) {
            val clauses = FlexibleClauseSetParser.parse(formula)
            return TableauxState(clauses)
        } else {
            val clauses = FlexibleClauseSetParser.parse(formula, params.cnfStrategy)
            return TableauxState(clauses, params.type, params.regular, params.backtracking)
        }
    }

    /**
     * Takes in a state object and a move and applies the move to the state if possible
     * Throws an exception explaining why the move is illegal otherwise
     * @param state current state object
     * @param move move to apply in the given state
     * @return state after the move was applied
     */
    @Suppress("ReturnCount")
    override fun applyMoveOnState(state: TableauxState, move: TableauxMove): TableauxState {
        // Pass expand, close, undo moves to relevant subfunction
        return when (move.type) {
            MoveType.CLOSE -> applyMoveCloseBranch(state, move.id1, move.id2)
            MoveType.EXPAND -> applyMoveExpandLeaf(state, move.id1, move.id2)
            MoveType.LEMMA -> applyMoveUseLemma(state, move.id1, move.id2)
            MoveType.UNDO -> applyMoveUndo(state)
        }
    }

    /**
     * Closes a branch in the proof tree is all relevant conditions are met
     * For rule specification see docs/PropositionalTableaux.md
     * @param state Current proof state
     * @param leafID Leaf node of the branch to be closed
     * @param closeNodeID Ancestor of the leaf to be used for closure
     * @return New state after rule was applied
     */
    private fun applyMoveCloseBranch(state: TableauxState, leafID: Int, closeNodeID: Int): TableauxState {

        ensureBasicCloseability(state, leafID, closeNodeID)

        val leaf = state.nodes[leafID]

        // Close branch
        leaf.closeRef = closeNodeID
        setNodeClosed(state, leaf)

        // Add move to state history
        if (state.backtracking) {
            state.moveHistory.add(TableauxMove(MoveType.CLOSE, leafID, closeNodeID))
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
    private fun applyMoveExpandLeaf(state: TableauxState, leafID: Int, clauseID: Int): TableauxState {
        ensureExpandability(state, leafID, clauseID)
        val clause = state.clauseSet.clauses[clauseID]
        val leaf = state.nodes[leafID]

        // Adding every atom in clause to leaf and set parameters
        for (atom in clause.atoms) {
            val newLeaf = TableauxNode(leafID, atom.lit, atom.negated)
            state.nodes.add(newLeaf)
            leaf.children.add(state.nodes.size - 1)
        }

        // Verify compliance with connectedness criteria
        verifyExpandConnectedness(state, leafID)

        // Add move to state history
        if (state.backtracking) {
            state.moveHistory.add(TableauxMove(MoveType.EXPAND, leafID, clauseID))
        }

        return state
    }

    private fun applyMoveUseLemma(state: TableauxState, leafID: Int, lemmaID: Int): TableauxState {
        // Verify that subtree root for lemma creation exists
        if (lemmaID >= state.nodes.size || lemmaID < 0)
            throw IllegalMove("Node with ID $lemmaID does not exist")
            // Verify that subtree root for lemma creation exists
        if (leafID >= state.nodes.size || leafID < 0)
            throw IllegalMove("Node with ID $leafID does not exist")

        val leaf = state.nodes[leafID]
        val lemmaNode = state.nodes[lemmaID]

        if (!leaf.isLeaf)
            throw IllegalMove("Node '$leaf' is not a leaf")

        if (leaf.isClosed)
            throw IllegalMove("Leaf '$leaf' is already closed")

        if (!lemmaNode.isClosed)
            throw IllegalMove("Node '$lemmaNode' is not the root of a closed subtableaux")

        if (lemmaNode.parent == null)
            throw IllegalMove("Root node cannot be used for lemma creation")

        val commonParent = lemmaNode.parent

        if (!state.nodeIsParentOf(commonParent, leafID))
            throw IllegalMove("Nodes '$leaf' and '$lemmaNode' are not siblings")

        val atom = lemmaNode.toAtom().not()

        // Verify compliance with regularity criteria
        // TODO this assumes FO lemmas will be preprocessed just like regular clause expansions
        // I have no idea if that is actually the case
        verifyExpandRegularity(state, leafID, Clause(mutableListOf(atom)))

        val newLeaf = TableauxNode(leafID, atom.lit, atom.negated, true)
        state.nodes.add(newLeaf)
        leaf.children.add(state.nodes.size - 1)

        // Verify compliance with connectedness criteria
        verifyExpandConnectedness(state, leafID)

        // Add move to state history
        if (state.backtracking) {
            state.moveHistory.add(TableauxMove(MoveType.LEMMA, leafID, lemmaID))
        }

        return state
    }

    /**
     *  Undo the last executed move
     *  @param state Current prove State
     *  @return New state after undoing last move
     */
    @Suppress("ThrowsCount")
    private fun applyMoveUndo(state: TableauxState): TableauxState {
        if (!state.backtracking)
            throw IllegalMove("Backtracking is not enabled for this proof")

        // Throw error if no moves were made already
        val history = state.moveHistory
        if (history.isEmpty())
            throw IllegalMove("Can't undo in initial state")

        // Retrieve and remove this undo from list
        val top = history.removeAt(state.moveHistory.size - 1)

        // Set usedUndo to true
        state.usedBacktracking = true

        // Pass undo move to relevant expand and close subfunction
        return when (top.type) {
            MoveType.CLOSE -> undoClose(state, top)
            MoveType.EXPAND -> undoExpand(state, top)
            MoveType.LEMMA -> undoLemma(state, top)
            else -> throw IllegalMove("Something went wrong. Move not implemented!")
        }
    }

    /**
     *  Undo close move
     *  @param state Current prove State
     *  @param move The last move executed
     *  @return New state after undoing latest close move
     */
    private fun undoClose(state: TableauxState, move: TableauxMove): TableauxState {
        val leafID = move.id1
        val leaf = state.nodes[leafID]

        // revert close reference to null
        leaf.closeRef = null

        var node: TableauxNode? = leaf

        while (node != null && node.isClosed) {
            node.isClosed = false
            node = if (node.parent == null) null else state.nodes[node.parent!!]
        }

        return state
    }

    /**
     *  Undo expand move
     *  @param state Current prove State
     *  @parm move The last move executed
     *  @return New state after undoing latest expand move
     */
    private fun undoExpand(state: TableauxState, move: TableauxMove): TableauxState {
        val leafID = move.id1
        val leaf = state.nodes[leafID]
        val children = leaf.children
        val nodes = state.nodes

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
    private fun undoLemma(state: TableauxState, move: TableauxMove) = undoExpand(state, move)

    /**
     * Checks if a given state represents a valid, closed proof.
     * @param state state object to validate
     * @return string representing proof closed state (true/false)
     */
    override fun checkCloseOnState(state: TableauxState) = getCloseMessage(state)

    /**
     * Parses a JSON state representation into a TableauxState object
     * @param json JSON state representation
     * @return parsed state object
     */
    @Suppress("TooGenericExceptionCaught")
    @kotlinx.serialization.UnstableDefault
    override fun jsonToState(json: String): TableauxState {
        try {
            val parsed = Json.parse(TableauxState.serializer(), json)

            // Ensure valid, unmodified state object
            if (!parsed.verifySeal())
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

            return parsed
        } catch (e: Exception) {
            val msg = "Could not parse JSON state: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    /**
     * Serializes internal state object to JSON
     * @param state State object
     * @return JSON state representation
     */
    @kotlinx.serialization.UnstableDefault
    override fun stateToJson(state: TableauxState): String {
        state.computeSeal()
        return Json.stringify(TableauxState.serializer(), state)
    }

    /*
     * Parses a JSON move representation into a TableauxMove object
     * @param json JSON move representation
     * @return parsed move object
     */
    @Suppress("TooGenericExceptionCaught")
    @kotlinx.serialization.UnstableDefault
    override fun jsonToMove(json: String): TableauxMove {
        try {
            return Json.parse(TableauxMove.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON move: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    /*
     * Parses a JSON parameter representation into a TableauxParam object
     * @param json JSON parameter representation
     * @return parsed param object
     */
    @Suppress("TooGenericExceptionCaught")
    @kotlinx.serialization.UnstableDefault
    override fun jsonToParam(json: String): TableauxParam {
        try {
            return Json.parse(TableauxParam.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON params: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }
}
