package kalkulierbar.psc

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.psc.*
import kalkulierbar.psc.NodeType
import kalkulierbar.parsers.FlexibleClauseSetParser
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

class PSC : JSONCalculus<PSCState, PSCMove, Unit>() {

    override val identifier = "psc"

    private val serializer = Json(context = pscMoveModule + kalkulierbar.psc.clausesetDiffModule)


    override fun parseFormulaToState(formula: String, params: Unit?): PSCState {
        val clauses = FlexibleClauseSetParser.parse(formula)
        val state = PSCState(clauses);
        state.tree.add(TreeNode(null, NodeType.ROOT, "true", Identity()))
        print(state)
        return state
    }

    override fun applyMoveOnState(state: PSCState, move: PSCMove): PSCState {
//        when (move) {
//            is MovePropagate -> kalkulierbar.psc.propagate(state, move.branch, move.baseClause, move.propClause, move.propAtom)
//            is MoveSplit -> kalkulierbar.psc.split(state, move.branch, move.literal)
//            is MovePrune -> kalkulierbar.psc.prune(state, move.branch)
//            is MoveModelCheck -> kalkulierbar.psc.checkModel(state, move.branch, move.interpretation)
//            else -> throw IllegalMove("Unknown move")
//        }
        return state
    }

    // override fun checkClose(state: String) = closeToJson(checkCloseOnState(jsonToState(state)))

    override fun checkCloseOnState(state: PSCState): CloseMessage {
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
    override fun jsonToState(json: String): PSCState {
        try {
            val parsed = serializer.parse(PSCState.serializer(), json)

            // Ensure valid, unmodified state object
            if (!parsed.verifySeal())
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

            return parsed
        } catch (e: Exception) {
            val msg = "Could not parse JSON state: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    override fun stateToJson(state: PSCState): String {
        state.computeSeal()
        return serializer.stringify(PSCState.serializer(), state)
    }

    @Suppress("TooGenericExceptionCaught")
    override fun jsonToMove(json: String): PSCMove {
        try {
            return serializer.parse(PSCMove.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON move: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    override fun jsonToParam(json: String) = Unit
}