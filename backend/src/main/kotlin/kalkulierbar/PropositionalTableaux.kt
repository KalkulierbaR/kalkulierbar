package kalkulierbar

import kalkulierbar.clause.ClauseSet
import kalkulierbar.parsers.ClauseSetParser
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonDecodingException

/**
 * Implementation of a simple tableaux calculus on propositional clause sets
 * For calculus specification see docs/PropositionalTableaux.md
 */
class PropositionalTableaux : JSONCalculus<TableauxState>() {

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
    @kotlinx.serialization.UnstableDefault
    override fun applyMoveOnState(state: TableauxState, move: String): TableauxState {
        try {
            val tableauxMove = Json.parse(TableauxMove.serializer(), move)

            // Pass expand or close moves to relevant subfunction
            if (tableauxMove.type == "c")
                return applyMoveCloseBranch(state, tableauxMove.id1, tableauxMove.id2)
            else if (tableauxMove.type == "e")
                return applyMoveExpandLeaf(state, tableauxMove.id1, tableauxMove.id2)
            else
                throw InvalidMoveFormat("Unknown move. Valid moves are e (expand) or c (close).")
        } catch (e: JsonDecodingException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move")
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
    @Suppress("ThrowsCount", "ComplexMethod")
    private fun applyMoveCloseBranch(state: TableauxState, leafID: Int, closeNodeID: Int): TableauxState {

        // Verify that both leaf and closeNode are valid nodes
        if (leafID >= state.nodes.size || leafID < 0)
            throw InvalidMoveFormat("Node with ID $leafID does not exist")
        if (closeNodeID >= state.nodes.size || closeNodeID < 0)
            throw InvalidMoveFormat("Node with ID $closeNodeID does not exist")

        val leaf = state.nodes.get(leafID)
        val closeNode = state.nodes.get(closeNodeID)

        // Verify that leaf is actually a leaf
        if (!leaf.isLeaf)
            throw InvalidMoveFormat("Node '$leaf' with ID $leafID is not a leaf")

        // Verify that leaf is not already closed
        if (leaf.isClosed)
            throw InvalidMoveFormat("Leaf '$leaf' is already closed, no need to close again")

        // Verify that leaf and closeNode reference the same variable
        if (!(leaf.spelling == closeNode.spelling))
            throw InvalidMoveFormat("Leaf '$leaf' and node '$closeNode' do not reference the same variable")

        // Verify that negation checks out
        if (leaf.negated == closeNode.negated) {
            val noneOrBoth = if (leaf.negated) "both of them" else "neither of them"
            val msg = "Leaf '$leaf' and node '$closeNode' reference the same variable, but $noneOrBoth are negated"
            throw InvalidMoveFormat(msg)
        }

        // Verify that closeNode is transitive parent of leaf
        if (!state.nodeIsParentOf(closeNodeID, leafID))
            throw InvalidMoveFormat("Node '$closeNode' is not an ancestor of leaf '$leaf'")

        // Close branch
        leaf.closeRef = closeNodeID
        leaf.isClosed = true

        return state
    }

    @Suppress("ThrowsCount")
    private fun applyMoveExpandLeaf(state: TableauxState, leafID: Int, clauseID: Int): TableauxState {
        // Verify that both leaf and clause are valid
        if (leafID >= state.nodes.size || leafID < 0)
            throw InvalidMoveFormat("Node with ID $leafID does not exist")
        if (clauseID >= state.clauseSet.clauses.size || clauseID < 0)
            throw InvalidMoveFormat("Clause with ID $clauseID does not exist")

        val leaf = state.nodes[leafID]
        val clause = state.clauseSet.clauses[clauseID]

        // Verify that leaf is actually a leaf
        if (!leaf.isLeaf)
            throw InvalidMoveFormat("Node '$leaf' with ID $leafID is not a leaf")

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
     * @return true if the given proof is closed and valid, false otherwise
     */
    override fun checkCloseOnState(state: TableauxState) = false

    /**
     * Parses a JSON state representation into a TableauxState object
     * @param json JSON state representation
     * @return parsed state object
     */
    @kotlinx.serialization.UnstableDefault
    override fun jsonToState(json: String): TableauxState {
        try {
            val parsed = Json.parse(TableauxState.serializer(), json)
            parsed.verifySeal() // Ensure valid, unmodified state object
            return parsed
        } catch (e: JsonDecodingException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state")
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
}

/**
 * Class representing a PropositionalTableaux proof
 * @param clauseSet The clause set to be proven unsatisfiable
 */
@Serializable
class TableauxState(val clauseSet: ClauseSet) {
    val nodes = mutableListOf<TableauxNode>(TableauxNode(0, "true", false))
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
        if (child.parent == 0 && parentID != 0)
            return false
        return nodeIsParentOf(child.parent, parentID)
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
     * Verify the state object checksum, throw an exception if the object has been modified
     * Call after importing state
     */
    fun verifySeal() {
        if (!TamperProtect.verify(getHash(), seal))
            throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")
    }

    /**
     * Pack the state into a well-defined, unambiguous string representation
     * Used to calculate checksums over state objects as JSON representation
     * might differ slightly between clients, encodings, etc
     * @return Canonical state representation
     */
    fun getHash(): String {
        val nodesHash = nodes.map { it.getHash() }.joinToString("|")
        val clauseSetHash = clauseSet.toString()
        return "tableauxstate|$clauseSetHash|[$nodesHash]"
    }
}

/**
 * Class representing a single node in the proof tree
 * @param parent ID of the parent node in the proof tree
 * @param spelling Name of the variable the node represents
 * @param negated True if the variable is negated, false otherwise
 */
@Serializable
class TableauxNode(val parent: Int, val spelling: String, val negated: Boolean) {
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
class TableauxMove(val type: String, val id1: Int, val id2: Int)
