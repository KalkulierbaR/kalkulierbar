package kalkulierbar.dpll

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
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

    private val serializer = Json(context = dpllMoveModule)

    override fun parseFormulaToState(formula: String, params: Unit?): DPLLState {
        val clauses = FlexibleClauseSetParser.parse(formula)
        val state = DPLLState()
        state.tree.add(TreeNode(null, NodeType.ROOT, "true", clauses))

        return state
    }

    override fun applyMoveOnState(state: DPLLState, move: DPLLMove): DPLLState {
        when (move) {
            is MovePropagate -> propagate(state, move.branch, move.baseClause, move.propClause, move.propAtom)
            // is MoveSplit -> split(state, move.branch, move.literal)
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

        val clauses = branch.diff.clauses

        if (baseID < 0 || baseID >= clauses.size)
            throw IllegalMove("Clause set $clauses has no clause with ID $baseID")
        if (propID < 0 || propID >= clauses.size)
            throw IllegalMove("Clause set $clauses has no clause with ID $propID")
        if (atomID < 0 || atomID >= clauses[propID].atoms.size)
            throw IllegalMove("Clause ${clauses[propID]} has no atom with ID $atomID")

        val base = clauses[baseID]

        if (base.atoms.size != 1)
            throw IllegalMove("Base clause $base may only have exactly one atom")

        val baseAtom = base.atoms[0]
        val propAtom = clauses[propID].atoms[atomID]
        val newCS = branch.diff.clone()

        if (baseAtom == propAtom)
            newCS.clauses.removeAt(propID)
        else if (baseAtom == propAtom.not())
            newCS.clauses[propID].atoms.removeAt(atomID)
        else
            throw IllegalMove("Selected atom '$propAtom' is not compatible with '$baseAtom'")

        state.tree.add(TreeNode(branchID, NodeType.PROP, "prop", newCS))
        branch.children.add(state.tree.size - 1)

        state.moveHistory.add(MovePropagate(branchID, baseID, propID, atomID))
    }

    override fun checkCloseOnState(state: DPLLState): CloseMessage {
        return CloseMessage(false, "The proof is not closed")
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
class DPLLState : ProtectedState() {
    val tree = mutableListOf<TreeNode>()
    val moveHistory = mutableListOf<DPLLMove>()

    override var seal = ""
    override fun getHash() = "itsalltrue"
}

@Serializable
class TreeNode(val parent: Int?, val type: NodeType, val label: String, val diff: ClauseSet<String>) {
    val children = mutableListOf<Int>()
    val isLeaf
        get() = children.size == 0
}

enum class NodeType {
    ROOT, PROP, SPLIT, MODEL
}

// Context object for move serialization
// Tells kotlinx.serialize about child types of DPLLMove
val dpllMoveModule = SerializersModule {
    polymorphic(DPLLMove::class) {
        MoveSplit::class with MoveSplit.serializer()
        MovePropagate::class with MovePropagate.serializer()
    }
}

@Serializable
abstract class DPLLMove

@Serializable
@SerialName("dpll-split")
data class MoveSplit(val branch: Int, val literal: Int) : DPLLMove()

@Serializable
@SerialName("dpll-prop")
data class MovePropagate(val branch: Int, val baseClause: Int, val propClause: Int, val propAtom: Int) : DPLLMove()
