package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.UnificationImpossible
import kalkulierbar.clause.Atom
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.Relation
import kalkulierbar.logic.transform.FirstOrderCNF
import kalkulierbar.logic.transform.Unification
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
        val clauses = FirstOrderCNF.transform(FirstOrderParser.parse(formula))

        if (params == null)
            return FoTableauxState(clauses, formula)
        else
            return FoTableauxState(clauses, formula, params.type, params.regular, params.backtracking)
    }

    override fun applyMoveOnState(state: FoTableauxState, move: FoTableauxMove): FoTableauxState {
        // Pass expand, close, undo moves to relevant subfunction
        return when (move.type) {
            FoMoveType.AUTOCLOSE -> applyAutoCloseBranch(state, move.id1, move.id2)
            FoMoveType.CLOSE -> applyMoveCloseBranch(state, move.id1, move.id2, move.getVarAssignTerms())
            FoMoveType.EXPAND -> applyMoveExpandLeaf(state, move.id1, move.id2)
            FoMoveType.UNDO -> applyMoveUndo(state)
        }
    }

    private fun applyAutoCloseBranch(state: FoTableauxState, leafID: Int, closeNodeID: Int): FoTableauxState {
        ensureBasicCloseability(state, leafID, closeNodeID)
        val leaf = state.nodes[leafID]
        val closeNode = state.nodes[closeNodeID]

        try {
            val varAssign = Unification.unify(leaf.relation, closeNode.relation)
            return closeBranchCommon(state, leafID, closeNodeID, varAssign)
        } catch (e: UnificationImpossible) {
            throw IllegalMove("Cannot unify '$leaf' and '$closeNode': ${e.message}")
        }
    }

    private fun applyMoveCloseBranch(state: FoTableauxState, leafID: Int, closeNodeID: Int, varAssign: Map<String, FirstOrderTerm>): FoTableauxState {
        ensureBasicCloseability(state, leafID, closeNodeID)
        return closeBranchCommon(state, leafID, closeNodeID, varAssign)
    }

    private fun closeBranchCommon(state: FoTableauxState, leafID: Int, closeNodeID: Int, varAssign: Map<String, FirstOrderTerm>): FoTableauxState {
        applyVarInstantiation(state, varAssign)

        val leaf = state.nodes[leafID]
        val closeNode = state.nodes[closeNodeID]

        if (leaf.relation != closeNode.relation)
            throw IllegalMove("Node '$leaf' and '$closeNode' are not equal after variable instantiation")

        if (state.regular && !checkRegularity(state))
            throw IllegalMove("This variable instantiation would violate the proof regularity")

        // Close branch
        leaf.closeRef = closeNodeID
        setNodeClosed(state, leaf)

        if (state.backtracking)
            state.moveHistory.add(FoTableauxMove(FoMoveType.CLOSE, leafID, closeNodeID, varAssign.mapValues { it.value.toString() }))

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

        if (state.backtracking)
            state.moveHistory.add(FoTableauxMove(FoMoveType.EXPAND, leafID, clauseID))

        return state
    }

    private fun applyMoveUndo(state: FoTableauxState): FoTableauxState {
        if (!state.backtracking)
            throw IllegalMove("Backtracking is not enabled for this proof")

        // Create a fresh clone-state with the same parameters and input formula
        val params = FoTableauxParam(state.type, state.regular, state.backtracking)
        var freshState = parseFormulaToState(state.formula, params)
        freshState.usedBacktracking = true

        // We don't want to re-do the last move
        state.moveHistory.removeAt(state.moveHistory.size - 1)

        // Re-build the proof tree in the clone state
        state.moveHistory.forEach {
            freshState = applyMoveOnState(freshState, it)
        }

        return freshState
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
        state.render()
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
    val formula: String,
    override val type: TableauxType = TableauxType.UNCONNECTED,
    override val regular: Boolean = false,
    override val backtracking: Boolean = false
) : GenericTableauxState<Relation>, ProtectedState() {
    override val nodes = mutableListOf<FoTableauxNode>(FoTableauxNode(null, Relation("true", listOf()), false))
    val moveHistory = mutableListOf<FoTableauxMove>()
    override var usedBacktracking = false
    var expansionCounter = 0

    override var seal = ""
    var renderedClauseSet = listOf<String>()

    /**
     * Check if a given node can be closed
     * @param nodeID ID of the node to check
     * @return true is the node can be closed, false otherwise
     */
    override fun nodeIsCloseable(nodeID: Int): Boolean {
        val node = nodes.get(nodeID)
        return node.isLeaf && nodeAncestryContainsUnifiable(nodeID, node.toAtom())
    }

    /**
     * Check if a given node can be closed with its immediate parent
     * @param nodeID ID of the node to check
     * @return true is the node can be closed directly, false otherwise
     */
    override fun nodeIsDirectlyCloseable(nodeID: Int): Boolean {
        val node = nodes[nodeID]
        if (node.parent == null || !node.isLeaf || node.negated == nodes[node.parent].negated)
            return false
        val parent = nodes[node.parent]

        var res: Boolean

        try {
            Unification.unify(node.relation, parent.relation)
            res = true
        } catch (e: UnificationImpossible) {
            res = false
        }

        return res
    }

    @Suppress("EmptyCatchBlock")
    private fun nodeAncestryContainsUnifiable(nodeID: Int, atom: Atom<Relation>): Boolean {
        var node = nodes[nodeID]

        // Walk up the tree from start node
        while (node.parent != null) {
            node = nodes[node.parent!!]
            // Check if current node can be unified with given atom
            if (node.negated != atom.negated && node.relation.spelling == atom.lit.spelling) {
                try {
                    Unification.unify(node.relation, atom.lit)
                    return true
                } catch (e: UnificationImpossible) {}
            }
        }

        return false
    }

    fun render() {
        renderedClauseSet = clauseSet.clauses.map { it.atoms.joinToString(", ") }
        nodes.forEach {
            it.render()
        }
    }

    override fun getHash(): String {
        val nodesHash = nodes.joinToString("|") { it.getHash() }
        val clauseSetHash = clauseSet.toString()
        val optsHash = "$type|$regular|$backtracking|$usedBacktracking"
        val variousHash = "$formula|$expansionCounter"
        val historyHash = moveHistory.map { "(${it.type},${it.id1},${it.id2},${it.varAssign})" }.joinToString(",")
        return "fotableaux|$variousHash|$optsHash|$clauseSetHash|[$nodesHash]|[$historyHash]"
    }
}

/**
 * Class representing a single node in the proof tree
 * @param parent ID of the parent node in the proof tree
 * @param spelling Name of the variable the node represents
 * @param negated True if the variable is negated, false otherwise
 */
@Serializable
class FoTableauxNode(
    override val parent: Int?,
    val relation: Relation,
    override val negated: Boolean
) : GenericTableauxNode<Relation> {

    override var isClosed = false
    override var closeRef: Int? = null
    override val children = mutableListOf<Int>()
    override var spelling = relation.toString()

    override val literalStem
        get() = "${relation.spelling}${relation.arguments.size}"

    override fun toString(): String {
        return if (negated) "!$relation" else "$relation"
    }

    override fun toAtom() = Atom(relation, negated)

    fun render() {
        spelling = relation.toString()
    }

    /**
     * Pack the node into a well-defined, unambiguous string representation
     * Used to calculate checksums over state objects as JSON representation
     * might differ slightly between clients, encodings, etc
     * @return Canonical node representations
     */
    fun getHash(): String {
        val neg = if (negated) "n" else "p"
        val closed = if (isClosed) "c" else "o"
        val ref = if (closeRef != null) closeRef.toString() else "-"
        val childlist = children.joinToString(",")
        return "$relation;$neg;$parent;$ref;$closed;($childlist)"
    }
}

@Serializable
data class FoTableauxMove(
    val type: FoMoveType,
    val id1: Int,
    val id2: Int,
    val varAssign: Map<String, String> = mapOf()
) {
    fun getVarAssignTerms() = varAssign.mapValues { FirstOrderParser.parseTerm(it.value) }
}

@Serializable
data class FoTableauxParam(
    val type: TableauxType,
    val regular: Boolean,
    val backtracking: Boolean
)

enum class FoMoveType {
    EXPAND, CLOSE, AUTOCLOSE, UNDO
}
