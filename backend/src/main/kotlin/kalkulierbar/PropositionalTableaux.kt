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
    override fun applyMoveOnState(state: TableauxState, move: String) = state

    /**
     * Checks if a given state represents a valid, closed proof.
     * @param state state object to validate
     * @return true if the given proof is closed and valid, false otherwise
     */
    @Suppress("ReturnCount")
    override fun checkCloseOnState(state: TableauxState): Boolean {
        // Iterating over every Leaf-Node
        for (node in state.nodes) {
            if (node.isLeaf) {
                // state closed -> Every leaf is closed
                if (node.closeRef == null || !node.isClosed)
                    return false
                val closedParent = state.nodes[node.closeRef!!]
                // One node has to be negated, the other not, both nodes have to have same spelling
                if (node.negated == closedParent.negated || node.spelling != closedParent.spelling)
                    return false
            }
        }
        return true
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
    val nodes = mutableListOf<TableauxNode>(TableauxNode(null, "true", false))
    var seal = ""

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
class TableauxNode(val parent: Int?, val spelling: String, val negated: Boolean) {
    var isClosed = false
    var closeRef: Int? = null
    val children = mutableListOf<Int>()
    val isLeaf
        get() = children.size == 0

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
