package kalkulierbar.dpll

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.parsers.FlexibleClauseSetParser
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class DPLL : JSONCalculus<DPLLState, DPLLMove, Unit>() {
    override val identifier = "dpll"

    override val serializer = Json { serializersModule = dpllMoveModule + clausesetDiffModule; encodeDefaults = true }
    override val moveSerializer = DPLLMove.serializer()
    override val stateSerializer = DPLLState.serializer()

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
            is MoveModelCheck -> checkModel(state, move.branch, move.interpretation)
            else -> throw IllegalMove("Unknown move")
        }
        return state
    }

    override fun checkCloseOnState(state: DPLLState): CloseMessage {
        // A proof is closed if every leaf is a 'closed' annotation
        // (which means every proper leaf contains the empty clause)
        val closed = state.tree.all { !it.isLeaf || it.type == NodeType.CLOSED }
        // There are no more rules to be applied if every leaf is an annotation
        // (-> every proper leaf is either closed or has a model)
        val done = state.tree.all { !it.isLeaf || it.isAnnotation }

        val msg = if (closed)
            "The proof is closed and proves the unsatisfiability of the clause set"
        else {
            val donemsg = if (done) "- however, all branches are completed. The clause set is satisfiable." else "yet."
            "The proof is not closed $donemsg"
        }

        return CloseMessage(closed, msg)
    }

    override fun jsonToParam(json: String) = Unit
}
