package kalkulierbar.tableaux

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.parsers.FlexibleClauseSetParser
import kotlinx.serialization.MissingFieldException
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonDecodingException

/**
 * Implementation of a simple tableaux calculus on propositional clause sets
 * For calculus specification see docs/PropositionalTableaux.md
 */
class PropositionalTableaux : JSONCalculus<TableauxState, TableauxMove, TableauxParam>() {

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
            return TableauxState(clauses, params.type, params.regular)
        }
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
        return if (move.type == "c")
            applyMoveCloseBranch(state, move.id1, move.id2)
        else if (move.type == "e")
            applyMoveExpandLeaf(state, move.id1, move.id2)
        else
            throw IllegalMove("Unknown move. Valid moves are e (expand) or c (close)")
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

        val leaf = state.nodes[leafID]
        val closeNode = state.nodes[closeNodeID]

        // Verify that leaf is actually a leaf
        if (!leaf.isLeaf)
            throw IllegalMove("Node '$leaf' is not a leaf")

        // Verify that leaf is not already closed
        if (leaf.isClosed)
            throw IllegalMove("Leaf '$leaf' is already closed, no need to close again")

        // Verify that leaf and closeNode reference the same variable
        if (leaf.spelling != closeNode.spelling)
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
        while (node.isLeaf || node.children.fold(true) { acc, e -> acc && state.nodes[e].isClosed }) {
            node.isClosed = true
            if (node.parent == null)
                break
            node = state.nodes[node.parent!!]
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

        // Adding every atom in clause to leaf and set parameters
        for (atom in clause.atoms) {
            val newLeaf = TableauxNode(leafID, atom.lit, atom.negated)
            state.nodes.add(newLeaf)
            leaf.children.add(state.nodes.size - 1)
        }

        // Verify compliance with connectedness criteria
        verifyExpandConnectedness(state, leafID)

        return state
    }

    /**
     * Checks if a given state represents a valid, closed proof.
     * @param state state object to validate
     * @return string representing proof closed state (true/false)
     */
    override fun checkCloseOnState(state: TableauxState): CloseMessage {
        var msg = "The proof tree is not closed"

        if (state.root.isClosed) {
            var connectedness = "unconnected"
            if (checkConnectedness(state, TableauxType.STRONGLYCONNECTED))
                connectedness = "strongly connected"
            else if (checkConnectedness(state, TableauxType.WEAKLYCONNECTED))
                connectedness = "weakly connected"

            val regularity = if (checkRegularity(state)) "regular " else ""

            msg = "The proof is closed and valid in a $connectedness ${regularity}tableaux"
        }

        return CloseMessage(state.root.isClosed, msg)
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
            throw JsonParseException(e.message
                    ?: "Could not parse JSON state - missing field")
        } catch (e: SerializationException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state")
        } catch (e: NumberFormatException) {
            throw JsonParseException(e.message
                    ?: "Could not parse JSON state - invalid number format")
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
            throw JsonParseException(e.message
                    ?: "Could not parse JSON move - missing field")
        } catch (e: SerializationException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move")
        } catch (e: NumberFormatException) {
            throw JsonParseException(e.message
                    ?: "Could not parse JSON move - invalid number format")
        }
    }

    /*
     * Parses a JSON parameter representation into a TableauxParam object
     * @param json JSON parameter representation
     * @return parsed param object
     */
    @kotlinx.serialization.UnstableDefault
    override fun jsonToParam(json: String): TableauxParam {
        try {
            return Json.parse(TableauxParam.serializer(), json)
        } catch (e: JsonDecodingException) {
            throw JsonParseException(e.message ?: "Could not parse JSON params")
        } catch (e: MissingFieldException) {
            throw JsonParseException(e.message
                    ?: "Could not parse JSON params - missing field")
        } catch (e: SerializationException) {
            throw JsonParseException(e.message ?: "Could not parse JSON params")
        } catch (e: NumberFormatException) {
            throw JsonParseException(e.message
                    ?: "Could not parse JSON params - invalid number format")
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
