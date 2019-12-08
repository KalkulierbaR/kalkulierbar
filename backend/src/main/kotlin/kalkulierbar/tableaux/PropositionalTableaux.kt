package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.parsers.ClauseSetParser
import kotlinx.serialization.MissingFieldException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonDecodingException

/**
 * Implementation of a simple tableaux calculus on propositional clause sets
 * For calculus specification see docs/PropositionalTableaux.md
 */
class PropositionalTableaux : JSONCalculus<TableauxState, TableauxMove>() {

    override val identifier = "prop-tableaux"

    /**
     * Parses a provided clause set as text into an initial internal state
     * Resulting state object will have a root node labeled 'true' in its tree
     * @param formula propositional clause set, format a,!b;!c,d
     * @return parsed state object
     */
    override fun parseFormulaToState(formula: String): TableauxState {
        val clauses = ClauseSetParser.parse(formula)
        return TableauxState(clauses)
    }

    /**
     * Takes in a state object and a move and applies the move to the state if possible
     * Throws an exception explaining why the move is illegal otherwise
     * @param state current state object
     * @param move move to apply in the given state
     * @return state after the move was applied
     */
    override fun applyMoveOnState(state: TableauxState, move: TableauxMove): TableauxState {
        // Pass expand or close moves to relevant subfunction
        if (move.type == "c")
            return applyMoveCloseBranch(state, move.id1, move.id2)
        else if (move.type == "e")
            return applyMoveExpandLeaf(state, move.id1, move.id2)
        else
            throw IllegalMove("Unknown move. Valid moves are e (expand) or c (close).")
    }

    /**
     * Closes a branch in the proof tree is all relevant conditions are met
     * For rule specification see docs/PropositionalTableaux.md
     * @param state Current proof state
     * @param leafID Leaf node of the branch to be closed
     * @param closeNodeID Ancestor of the leaf to be used for closure
     * @return New state after rule was applied
     */
    @Suppress("ThrowsCount", "ComplexMethod")
    private fun applyMoveCloseBranch(state: TableauxState, leafID: Int, closeNodeID: Int): TableauxState {

        // Verify that both leaf and closeNode are valid nodes
        if (leafID >= state.nodes.size || leafID < 0)
            throw IllegalMove("Node with ID $leafID does not exist")
        if (closeNodeID >= state.nodes.size || closeNodeID < 0)
            throw IllegalMove("Node with ID $closeNodeID does not exist")

        val leaf = state.nodes.get(leafID)
        val closeNode = state.nodes.get(closeNodeID)

        // Verify that leaf is actually a leaf
        if (!leaf.isLeaf)
            throw IllegalMove("Node '$leaf' is not a leaf")

        // Verify that leaf is not already closed
        if (leaf.isClosed)
            throw IllegalMove("Leaf '$leaf' is already closed, no need to close again")

        // Verify that leaf and closeNode reference the same variable
        if (!(leaf.spelling == closeNode.spelling))
            throw IllegalMove("Leaf '$leaf' and node '$closeNode' do not reference the same variable")

        // Verify that negation checks out
        if (leaf.negated == closeNode.negated) {
            val noneOrBoth = if (leaf.negated) "both of them" else "neither of them"
            val msg = "Leaf '$leaf' and node '$closeNode' reference the same variable, but $noneOrBoth are negated"
            throw IllegalMove(msg)
        }

        // Ensure that tree root node cannot be used to close variables of same spelling ('true')
        if (closeNodeID == 0)
            throw IllegalMove("The root node cannot be used for branch closure")

        // Verify that closeNode is transitive parent of leaf
        if (!state.nodeIsParentOf(closeNodeID, leafID))
            throw IllegalMove("Node '$closeNode' is not an ancestor of leaf '$leaf'")

        // Close branch
        leaf.closeRef = closeNodeID
        var node = leaf

        // Set isClosed to true for all nodes dominated by leaf in reverse tree
        while (node.isLeaf || node.children.fold(true) { acc, e -> acc && state.nodes.get(e).isClosed }) {
            node.isClosed = true
            if (node.parent == null)
                break
            node = state.nodes.get(node.parent!!)
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
        // Verify that both leaf and clause are valid
        if (leafID >= state.nodes.size || leafID < 0)
            throw IllegalMove("Node with ID $leafID does not exist")
        if (clauseID >= state.clauseSet.clauses.size || clauseID < 0)
            throw IllegalMove("Clause with ID $clauseID does not exist")

        val leaf = state.nodes[leafID]
        val clause = state.clauseSet.clauses[clauseID]

        // Move should be compatible with regularity restriction
        if (state.regular) {
            val names = collectSubtreeNames(state, 0)

            for (atom in clause.atoms) {
                val atomName = atom.toString()

                // check list for double atom name
                if (names.contains(atomName))
                    throw IllegalMove("Tree already contains Atom \"$atomName\" (double variables not allowed!)")

                // If atomName compatible then add to name list
                else
                    names.add(atomName)
            }
        }

        // Verify that leaf is actually a leaf
        if (!leaf.isLeaf)
            throw IllegalMove("Node '$leaf' is not a leaf")

        if (leaf.isClosed)
            throw IllegalMove("Node '$leaf' is already closed")

        // Adding every atom in clause to leaf and set parameters
        for (atom in clause.atoms) {
            val newLeaf = TableauxNode(leafID, atom.lit, atom.negated)
            state.nodes.add(newLeaf)

            val stateNodeSize = state.nodes.size
            leaf.children.add(stateNodeSize - 1)
        }

        return state
    }

    /**
     * Checks if a given state represents a valid, closed proof.
     * @param state state object to validate
     * @return string representing proof closed state (true/false)
     */
    @Suppress("ReturnCount")
    override fun checkCloseOnState(state: TableauxState) = state.root.isClosed.toString()

    /**
     * Checks if the given state meets all requirements wrt regularity and connectedness
     * @param state state object to check
     * @return true iff the proof tree meets all required criteria
     */
    private fun checkRestrictions(state: TableauxState): Boolean {
        var connectedness: Boolean
        var regularity: Boolean

        when (state.type) {
            TableauxType.UNCONNECTED -> connectedness = true
            TableauxType.WEAKLYCONNECTED -> connectedness = checkConnectedness(state, false)
            TableauxType.STRONGLYCONNECTED -> connectedness = checkConnectedness(state, true)
        }

        regularity = !state.regular || false

        return connectedness && regularity
    }

    /**
     * Verifies that a proof tree is weakly/strongly connected
     *
     * This method will return false even if the current tree can be transformed
     * into a weakly connected tree by applying close moves
     * @param state state object to check for connectedness
     * @param strong true for strong connectedness, false for weak connectedness
     * @return true iff the proof tree is strongly/weakly connected
     */
    private fun checkConnectedness(state: TableauxState, strong: Boolean): Boolean {
        val startNodes = state.root.children // root is excluded from connectedness criteria

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
    private fun checkConnectedSubtree(state: TableauxState, root: Int, strong: Boolean): Boolean {
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
     * This method DOES exclude the root from the connectedness criteria
     * therefore it CAN be used on the global proof tree root directly.
     *
     * @param state state object to check for regularity
     * @return true iff the proof tree is regular
     */
    private fun checkRegularity(state: TableauxState): Boolean {
        val startNodes = state.root.children

        // The root node can't have any double vars
        if (startNodes.isEmpty())
            return true

        // collect spelling of child nodes
        var lst = mutableListOf<String>()

        for (id in startNodes)
            lst.addAll(collectSubtreeNames(state, id))

        // Check list for double variables
        for (i in lst.indices)
            for (j in lst.indices)
                if (lst[i] == lst[j] && i != j)
                    return false

        return true
    }

    /**
     * Collects all unique names of the root and child nodes and their child nodes respectively.
     *
     * @param state : state object to search in node tree
     * @param root : ID of the subtree node from which to collect the names
     * @return A list containing all unique node names of the given subtree
     */
    private fun collectSubtreeNames(state: TableauxState, root: Int): MutableList<String> {
        val node = state.nodes[root]
        var lst = mutableListOf<String>()

        // Add node spelling to list iff node is leaf
        lst.add(node.toString())
        if (node.isLeaf)
            return lst

        for (id in node.children) {
            lst.addAll(collectSubtreeNames(state, id))
        }
        return lst
    }

    /**
     * Parses a JSON state representation into a TableauxState object
     * @param json JSON state representation
     * @return parsed state object
     */
    @kotlinx.serialization.UnstableDefault
    override fun jsonToState(json: String): TableauxState {
        try {
            val parsed = Json.parse(TableauxState.serializer(), json)

            // Ensure valid, unmodified state object
            if (!parsed.verifySeal())
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

            return parsed
        } catch (e: JsonDecodingException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state")
        } catch (e: MissingFieldException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state - missing field")
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
    @kotlinx.serialization.UnstableDefault
    override fun jsonToMove(json: String): TableauxMove {
        try {
            return Json.parse(TableauxMove.serializer(), json)
        } catch (e: JsonDecodingException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move")
        } catch (e: MissingFieldException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move - missing field")
        }
    }

    /**
     * Provides some API documentation regarding formats used for inputs and outputs
     * @return plaintext API documentation
     */
    override fun getDocumentation(): String {
        return """Takes a clause set as an input, format a,!b;b,!c;d with variables in [a-zA-Z]+\n
            |Possible moves are expand and close of the following JSON format:\n
            |Expand: {type: "e", id1: <ID of leaf to expand on>, id2: <ID of clause to expand>}\n
            |Close: {type: "c", id1: <ID of leaf to close>, id2: <ID of node to close with>}\n
            |where IDs are the positions of the node or clause in the nodes or clauses list of the state object."""
    }
}
