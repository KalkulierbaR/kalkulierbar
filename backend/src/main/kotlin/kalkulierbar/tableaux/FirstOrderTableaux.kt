package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.clause.Atom
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.Relation
import kalkulierbar.logic.transform.FirstOrderCNF
import kalkulierbar.logic.transform.VariableInstantiator
import kalkulierbar.logic.transform.VariableSuffixAppend
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.MissingFieldException
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonDecodingException

val serializer = Json(context = FoTermModule)

@Suppress("TooManyFunctions")
class FirstOrderTableaux : GenericTableaux<Relation>, JSONCalculus<FoTableauxState, FoTableauxMove, FoTableauxParam>() {

    override val identifier = "fo-tableaux"

    override fun parseFormulaToState(formula: String, params: FoTableauxParam?): FoTableauxState {
        val parser = FirstOrderParser()
        val clauses = FirstOrderCNF.transform(parser.parse(formula))

        if (params == null)
            return FoTableauxState(clauses)
        else
            return FoTableauxState(clauses, params.type, params.regular, params.backtracking)
    }

    override fun applyMoveOnState(state: FoTableauxState, move: FoTableauxMove): FoTableauxState {
        // Pass expand, close, undo moves to relevant subfunction
        return when (move.type) {
            // MoveType.AUTOCLOSE -> applyAutoCloseBranch(state, move.id1, move.id2)
            MoveType.CLOSE -> applyMoveCloseBranch(state, move.id1, move.id2, move.varAssign)
            MoveType.EXPAND -> applyMoveExpandLeaf(state, move.id1, move.id2)
            MoveType.UNDO -> applyMoveUndo(state)

            else -> throw IllegalMove("Unknown move. Valid moves are EXPAND, CLOSE, ATUOCLOSE or UNDO.")
        }
    }

    private fun applyAutoCloseBranch(state: FoTableauxState, leafID: Int, closeNodeID: Int): FoTableauxState {
        val varAssign = mapOf<String, FirstOrderTerm>()
        return applyMoveCloseBranch(state, leafID, closeNodeID, varAssign)
    }

    private fun applyMoveCloseBranch(state: FoTableauxState, leafID: Int, closeNodeID: Int, varAssign: Map<String, FirstOrderTerm>): FoTableauxState {

        ensureBasicCloseability(state, leafID, closeNodeID)

        val leaf = state.nodes[leafID]
        val closeNode = state.nodes[closeNodeID]

        applyVarInstantiation(state, varAssign)

        if (leaf.relation != closeNode.relation)
            throw IllegalMove("Node '$leaf' and '$closeNode' are not equal after variable instantiation")

        if (state.regular && !checkRegularity(state))
            throw IllegalMove("This variable instantiation would violate the proof regularity")

        // Close branch
        leaf.closeRef = closeNodeID
        setNodeClosed(state, leaf)

        // TODO: Backtracking

        return state
    }

    private fun applyMoveExpandLeaf(state: FoTableauxState, leafID: Int, clauseID: Int): FoTableauxState {
        ensureExpandability(state, leafID, clauseID)
        val clause = state.clauseSet.clauses[clauseID]
        val leaf = state.nodes[leafID]

        state.expansionCounter += 1
        val suffixAppender = VariableSuffixAppend("v${state.expansionCounter}")

        // Adding every atom in clause to leaf and set parameters
        for (atom in clause.atoms) {
            val relation = atom.lit
            relation.arguments = relation.arguments.map { it.accept(suffixAppender) }
            val newLeaf = FoTableauxNode(leafID, relation, atom.negated)
            state.nodes.add(newLeaf)
            leaf.children.add(state.nodes.size - 1)
        }

        // Verify compliance with connectedness criteria
        verifyExpandConnectedness(state, leafID)

        // TODO: Backtracking

        return state
    }

    private fun applyMoveUndo(state: FoTableauxState): FoTableauxState {
        if (!state.backtracking)
            throw IllegalMove("Backtracking is not enabled for this proof")

        // TODO
        return state
    }

    override fun checkCloseOnState(state: FoTableauxState) = getCloseMessage(state)

    private fun applyVarInstantiation(state: FoTableauxState, varAssign: Map<String, FirstOrderTerm>): FoTableauxState {
        val instantiator = VariableInstantiator(varAssign)

        state.nodes.forEach {
            it.relation.arguments = it.relation.arguments.map { it.accept(instantiator) }
        }

        return state
    }

    /**
     * Parses a JSON state representation into a TableauxState object
     * @param json JSON state representation
     * @return parsed state object
     */
    @kotlinx.serialization.UnstableDefault
    override fun jsonToState(json: String): FoTableauxState {
        try {
            val parsed = serializer.parse(FoTableauxState.serializer(), json)

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
    override fun stateToJson(state: FoTableauxState): String {
        state.computeSeal()
        return serializer.stringify(FoTableauxState.serializer(), state)
    }

    /*
     * Parses a JSON move representation into a TableauxMove object
     * @param json JSON move representation
     * @return parsed move object
     */
    @kotlinx.serialization.UnstableDefault
    override fun jsonToMove(json: String): FoTableauxMove {
        try {
            return Json.parse(FoTableauxMove.serializer(), json)
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
    override fun jsonToParam(json: String): FoTableauxParam {
        try {
            return Json.parse(FoTableauxParam.serializer(), json)
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
}

@Serializable
class FoTableauxState(
    override val clauseSet: ClauseSet<Relation>,
    override val type: TableauxType = TableauxType.UNCONNECTED,
    override val regular: Boolean = false,
    override val backtracking: Boolean = false
) : GenericTableauxState<Relation>, ProtectedState() {
    override val nodes = mutableListOf<FoTableauxNode>(FoTableauxNode(null, Relation("true", listOf()), false))
    val moveHistory = mutableListOf<FoTableauxMove>()
    override var usedBacktracking = false
    var expansionCounter = 0
    override var seal = ""

    /**
     * Check if a given node can be closed
     * @param nodeID ID of the node to check
     * @return true is the node can be closed, false otherwise
     */
    override fun nodeIsCloseable(nodeID: Int): Boolean {
        val node = nodes.get(nodeID)
        return node.isLeaf && nodeAncestryContainsAtom(nodeID, node.toAtom().not())
    }

    /**
     * Check if a given node can be closed with its immediate parent
     * @param nodeID ID of the node to check
     * @return true is the node can be closed directly, false otherwise
     */
    override fun nodeIsDirectlyCloseable(nodeID: Int): Boolean {
        val node = nodes[nodeID]
        if (node.parent == null)
            return false
        val parent = nodes[node.parent]

        return node.isLeaf && node.toAtom() == parent.toAtom().not()
    }

    /**
     * Check if a node's ancestry includes a specified atom
     * @param nodeID ID of the node to check
     * @param atom the atom to search for
     * @return true iff the node's transitive parents include the given atom
     */
    private fun nodeAncestryContainsAtom(nodeID: Int, atom: Atom<Relation>): Boolean {
        var node = nodes[nodeID]

        // Walk up the tree from start node
        while (node.parent != null) {
            node = nodes[node.parent!!]
            // Check if current node is identical to atom
            if (node.toAtom() == atom)
                return true
        }

        return false
    }

    override fun getHash() = "HashyMcHashface"
}

/**
 * Class representing a single node in the proof tree
 * @param parent ID of the parent node in the proof tree
 * @param spelling Name of the variable the node represents
 * @param negated True if the variable is negated, false otherwise
 */
@Serializable
class FoTableauxNode(override val parent: Int?, val relation: Relation, override val negated: Boolean) : GenericTableauxNode<Relation> {
    override var isClosed = false
    override var closeRef: Int? = null
    override val children = mutableListOf<Int>()
    override val isLeaf
        get() = children.size == 0
    override val spelling
        get() = relation.toString()
    override val literalStem
        get() = "${relation.spelling}${relation.arguments.size}"

    override fun toString(): String {
        return if (negated) "!$spelling" else spelling
    }

    override fun toAtom() = Atom(relation, negated)
}

@Serializable
data class FoTableauxMove(val type: MoveType, val id1: Int, val id2: Int, val varAssign: Map<String, FirstOrderTerm>)

@Serializable
data class FoTableauxParam(
    val type: TableauxType,
    val regular: Boolean,
    val backtracking: Boolean
)
