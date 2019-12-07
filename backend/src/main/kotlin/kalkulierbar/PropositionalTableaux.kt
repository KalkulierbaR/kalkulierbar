package kalkulierbar

import kalkulierbar.clause.Atom
import kalkulierbar.clause.ClauseSet
import kalkulierbar.parsers.ClauseSetParser
import kotlinx.serialization.MissingFieldException
import kotlinx.serialization.Serializable
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
    override fun checkCloseOnState(state: TableauxState): String {
        // Iterating over every Leaf-Node
        for (node in state.nodes) {
            if (node.isLeaf) {
                // state closed -> Every lead is closed
                if (node.closeRef == null || !node.isClosed)
                    return "false"
                val closedParent = state.nodes[node.closeRef!!]
                // One node has to be negated, the other not, both nodes have to have same spelling
                if (node.negated == closedParent.negated || node.spelling != closedParent.spelling)
                    return "false"
            }
        }
        return "true"
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
            parsed.verifySeal() // Ensure valid, unmodified state object
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

/**
 * Class representing a PropositionalTableaux proof
 * @param clauseSet The clause set to be proven unsatisfiable
 */
@Serializable
class TableauxState(val clauseSet: ClauseSet, val type: TableauxType = TableauxType.UNCONNECTED, val restrictDoubleVars: Boolean = false) {
    val nodes = mutableListOf<TableauxNode>(TableauxNode(null, "true", false))
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

    fun nodeIsCloseable(nodeID: Int): Boolean {
        val node = nodes.get(nodeID)
        return node.isLeaf && nodeAncestryContainsAtom(nodeID, Atom(node.spelling, node.negated))
    }

    fun nodeAncestryContainsAtom(nodeID: Int, atom: Atom): Boolean {
        var node = nodes.get(nodeID)

        // Walk up the tree from start node
        while (node.parent != null) {
            node = nodes.get(node.parent!!)
            // Check if current node is identical to atom
            if (node.spelling == atom.lit && node.negated == atom.negated)
                return true
        }

        return false
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
        return "tableauxstate|$type|$restrictDoubleVars|$clauseSetHash|[$nodesHash]"
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
