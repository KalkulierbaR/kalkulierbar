package kalkulierbar.dpll

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kalkulierbar.parsers.FlexibleClauseSetParser
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.plus

class PropositionalDPLL : JSONCalculus<DPLLState, DPLLMove, Unit>() {

    override val identifier = "prop-dpll"

    private val serializer = Json(context = dpllMoveModule + clausesetDiffModule)

    override fun parseFormulaToState(formula: String, params: Unit?): DPLLState {
        val clauses = FlexibleClauseSetParser.parse(formula)
        val state = DPLLState(clauses)
        state.tree.add(TreeNode(null, NodeType.ROOT, "true", Identity()))

        return state
    }

    override fun applyMoveOnState(state: DPLLState, move: DPLLMove): DPLLState {
        when (move) {
            is MovePropagate -> propagate(state, move.branch, move.baseClause, move.propClause, move.propAtom)
            is MoveSplit -> split(state, move.branch, move.literal)
            is MovePrune -> prune(state, move.branch)
            else -> throw IllegalMove("Unknown move")
        }
        return state
    }

    @Suppress("ThrowsCount", "ComplexMethod")
    private fun propagate(state: DPLLState, branchID: Int, baseID: Int, propID: Int, atomID: Int) {
        if (branchID < 0 || branchID >= state.tree.size)
            throw IllegalMove("Branch with ID $branchID does not exist")

        val branch = state.tree[branchID]
        if (!branch.isLeaf)
            throw IllegalMove("ID $branchID does not reference a leaf")
        if (branch.isAnnotation)
            throw IllegalMove("Cannot propagate on annotation '$branch'")

        val clauseSet = state.getClauseSet(branchID)
        val clauses = clauseSet.clauses

        if (baseID < 0 || baseID >= clauses.size)
            throw IllegalMove("Clause set $clauses has no clause with ID $baseID")
        if (propID < 0 || propID >= clauses.size)
            throw IllegalMove("Clause set $clauses has no clause with ID $propID")
        if (atomID < 0 || atomID >= clauses[propID].size)
            throw IllegalMove("Clause ${clauses[propID]} has no atom with ID $atomID")

        val base = clauses[baseID]
        if (base.size != 1)
            throw IllegalMove("Base clause $base may only have exactly one atom")

        val baseAtom = base.atoms[0]
        val propAtom = clauses[propID].atoms[atomID]
        val diff: CsDiff

        // If the selected clause contains the atom which we know must be true,
        // the whole clause is trivially true and we can remove it from the set
        if (baseAtom == propAtom)
            diff = RemoveClause(propID)
        // If the selected clause contains the negation of the atom known to be true,
        // that atom cannot be true and can be removed from the clause
        else if (baseAtom == propAtom.not())
            diff = RemoveAtom(propID, atomID)
        else
            throw IllegalMove("Selected atom '$propAtom' is not compatible with '$baseAtom'")

        val propNode = TreeNode(branchID, NodeType.PROP, "prop", diff)
        val propNodeID = state.tree.size
        state.tree.add(propNode)
        branch.children.add(propNodeID)

        // Add proper annotations if the node created by propagation is closed or represents a model
        val newClauses = diff.apply(clauseSet).clauses

        if (newClauses.any { it.isEmpty() }) {
            state.tree.add(TreeNode(propNodeID, NodeType.CLOSED, "closed", Identity()))
            propNode.children.add(state.tree.size - 1)
        }
        // A node is considered a model if it contains only single-atom clauses
        // that do not contradict each other and contain no duplicates
        else if (
            newClauses.all { it.size == 1 } &&
            newClauses.map { it.atoms[0].lit }.distinct().size == newClauses.size
        ) {
            state.tree.add(TreeNode(propNodeID, NodeType.MODEL, "model", Identity()))
            propNode.children.add(state.tree.size - 1)
        }
    }

    @Suppress("ThrowsCount")
    private fun split(state: DPLLState, branchID: Int, literal: String) {
        if (branchID < 0 || branchID >= state.tree.size)
            throw IllegalMove("Branch with ID $branchID does not exist")

        val branch = state.tree[branchID]
        if (!branch.isLeaf)
            throw IllegalMove("ID $branchID does not reference a leaf")
        if (branch.isAnnotation)
            throw IllegalMove("Cannot split on annotation '$branch'")

        // Add a case distinction for $literal
        val trueClause = Clause(mutableListOf(Atom(literal, false)))
        val falseClause = Clause(mutableListOf(Atom(literal, true)))
        val nodeTrue = TreeNode(branchID, NodeType.SPLIT, "$literal", AddClause(trueClause))
        val nodeFalse = TreeNode(branchID, NodeType.SPLIT, "¬$literal", AddClause(falseClause))

        state.tree.add(nodeTrue)
        branch.children.add(state.tree.size - 1)
        state.tree.add(nodeFalse)
        branch.children.add(state.tree.size - 1)
    }

    private fun prune(state: DPLLState, branchID: Int) {
        if (branchID < 0 || branchID >= state.tree.size)
            throw IllegalMove("Branch with ID $branchID does not exist")

        val node = state.tree[branchID]

        // Weird things would happen if we would allow removing annotations
        if (node.children.size == 1 && state.tree[node.children[0]].isAnnotation)
            throw IllegalMove("Cannot prune annotation '${state.tree[node.children[0]]}'")

        state.pruneBranch(branchID)
    }

    override fun checkCloseOnState(state: DPLLState): CloseMessage {
        // A proof is closed if every leaf is a 'closed' annotation
        // (which means every proper leaf contains the empty clause)
        val closed = state.tree.all { !it.isLeaf || it.type == NodeType.CLOSED }
        // There are no more rules to be applied if every leaf is an annotation
        // (-> every proper leaf is either closed or has a model)
        val done = state.tree.all { !it.isLeaf || it.isAnnotation }
        val msg: String

        if (closed)
            msg = "The proof is closed and proves the unsatisfiability of the clause set"
        else {
            val donemsg = if (done) "- however, all branches are completed. The clause set is satisfiable." else "yet."
            msg = "The proof is not closed $donemsg"
        }

        return CloseMessage(closed, msg)
    }

    @Suppress("TooGenericExceptionCaught")
    override fun jsonToState(json: String): DPLLState {
        try {
            val parsed = serializer.parse(DPLLState.serializer(), json)

            // Ensure valid, unmodified state object
            if (!parsed.verifySeal())
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

            return parsed
        } catch (e: Exception) {
            val msg = "Could not parse JSON state: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    override fun stateToJson(state: DPLLState): String {
        state.computeSeal()
        return serializer.stringify(DPLLState.serializer(), state)
    }

    @Suppress("TooGenericExceptionCaught")
    override fun jsonToMove(json: String): DPLLMove {
        try {
            return serializer.parse(DPLLMove.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON move: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    override fun jsonToParam(json: String) = Unit
}

@Serializable
class DPLLState(val clauseSet: ClauseSet<String>) : ProtectedState() {
    val tree = mutableListOf<TreeNode>()

    /**
     * Remove all children of a node from the proof tree
     * This requires some index shifting magic due to the list representation
     * of the tree, but I figure it's still better than figuring out a way to
     * serialize doubly-linked trees and define IDs on that
     * @param id ID of the node whose children are to be pruned
     */
    fun pruneBranch(id: Int) {
        // Collect all transitive children of the node
        // (not deleting anything yet to keep index structures intact)
        val worklist = mutableListOf<Int>()
        worklist.addAll(tree[id].children)

        while (worklist.isNotEmpty()) {
            val node = tree[worklist.removeAt(0)]
            worklist.addAll(node.children)
        }

        // Remove each identified child, keeping parent references but not children references
        worklist.forEach {
            removeNodeInconsistent(it)
        }

        // Re-compute children references
        rebuildChildRefs()
    }

    /**
     * Removes a node from the proof tree, keeping parent references intact
     * NOTE: This will most likely leave the children references in an INCONSISTENT state
     *       Use rebuildChildRefs() to ensure valid children references
     * @param id ID of the node to remove
     */
    private fun removeNodeInconsistent(id: Int) {
        tree.removeAt(id)
        tree.forEach {
            if (it.parent != null && it.parent!! > id)
                it.parent = it.parent!! - 1
        }
    }

    /**
     * Rebuilds children references in the entire proof tree from parent references
     */
    private fun rebuildChildRefs() {
        tree.forEach { it.children.clear() }

        for (i in tree.indices) {
            if (tree[i].parent != null)
                tree[tree[i].parent!!].children.add(i)
        }
    }

    /**
     * Applies the clause set deltas stored in the proof tree to 'check out'
     * the full clause set of a node in the tree
     * @param branch ID of the node/branch whose clause set should be computed
     * @return Full clause set associated with the given node
     */
    fun getClauseSet(branch: Int): ClauseSet<String> {
        var node = tree[branch]
        val diffs = mutableListOf<CsDiff>()
        var res = clauseSet

        while (node.parent != null) {
            diffs.add(node.diff)
            node = tree[node.parent!!]
        }

        diffs.asReversed().forEach {
            res = it.apply(res)
        }

        return res
    }

    override var seal = ""
    override fun getHash() = "itsalltrue"
}

@Serializable
class TreeNode(var parent: Int?, val type: NodeType, val label: String, val diff: CsDiff) {
    val children = mutableListOf<Int>()
    val isLeaf
        get() = children.size == 0
    val isAnnotation
        get() = (type == NodeType.MODEL || type == NodeType.CLOSED)
}

enum class NodeType {
    ROOT, PROP, SPLIT, MODEL, CLOSED
}

// Context object for move serialization
// Tells kotlinx.serialize about child types of DPLLMove
val dpllMoveModule = SerializersModule {
    polymorphic(DPLLMove::class) {
        MoveSplit::class with MoveSplit.serializer()
        MovePropagate::class with MovePropagate.serializer()
        MovePrune::class with MovePrune.serializer()
        MoveModelCheck::class with MoveModelCheck.serializer()
    }
}

@Serializable
abstract class DPLLMove

@Serializable
@SerialName("dpll-split")
data class MoveSplit(val branch: Int, val literal: String) : DPLLMove()

@Serializable
@SerialName("dpll-prop")
data class MovePropagate(val branch: Int, val baseClause: Int, val propClause: Int, val propAtom: Int) : DPLLMove()

@Serializable
@SerialName("dpll-prune")
data class MovePrune(val branch: Int) : DPLLMove()

@Serializable
@SerialName("dpll-modelcheck")
data class MoveModelCheck(val branch: Int, val interpretation: Map<String, Boolean>)
