package kalkulierbar.resolution

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.clause.Atom
import kalkulierbar.clause.ClauseSet

interface GenericResolution<AtomType>

interface GenericResolutionState<AtomType> {
    val clauseSet: ClauseSet<AtomType>
    val hiddenClauses: ClauseSet<AtomType>
    val visualHelp: VisualHelp
    var newestNode: Int

    /**
     * Get information about a proof state
     * @param state Current proof state
     * @return CloseMessage containing information about the proof status
     */
    fun getCloseMessage(): CloseMessage {
        val hasEmptyClause = clauseSet.clauses.any { it.isEmpty() }
        val msg = if (hasEmptyClause) "The proof is closed" else "The proof is not closed"
        return CloseMessage(hasEmptyClause, msg)
    }

    /**
     * Create a new clause by resolving two existing clauses and add it to the clause set
     * If the given literal is null, a suitable literal will be chosen automatically
     * @param state Proof state to apply resolution in
     * @param clause1 ID of the first clause to use for resolution
     * @param clause2 ID of the second clause to use for resolution
     * @param literal Literal present in both clauses to use for resolution
     */
    @Suppress("ThrowsCount", "ComplexMethod")
    fun resolve(
        clause1: Int,
        clause2: Int,
        literal: AtomType?,
        insertAtEnd: Boolean = false
    ) {
        val clauses = clauseSet.clauses

        // Verify that the clause ids are valid
        if (clause1 == clause2)
            throw IllegalMove("Both ids refer to the same clause")
        if (clause1 < 0 || clause1 >= clauses.size)
            throw IllegalMove("There is no clause with id $clause1")
        if (clause2 < 0 || clause2 >= clauses.size)
            throw IllegalMove("There is no clause with id $clause2")

        val c1 = clauses[clause1]
        val c2 = clauses[clause2]
        val resCandidates: Pair<Atom<AtomType>, Atom<AtomType>>

        // If the frontend did not pass a resolution target, we'll try to find one ourselves
        if (literal == null) {
            resCandidates = getAutoResolutionCandidates(c1, c2)
        } else {
            // Filter clauses for atoms with correct literal
            resCandidates = filterClause(c1, c2, literal)
        }

        val (a1, a2) = resCandidates

        // Add the new node where the second one was unless specified otherwise
        // This should be pretty nice for the user
        newestNode = if (insertAtEnd) clauses.size else clause2

        clauses.add(newestNode, buildClause(c1, a1, c2, a2))
    }

    /**
     * Hide a clause from the main view
     * @param state Current proof state
     * @param clauseID ID of the clause to be hidden
     */
    fun hide(clauseID: Int) {
        if (clauseID < 0 || clauseID >= clauseSet.clauses.size)
            throw IllegalMove("There is no clause with id $clauseID")

        // Move clause from main clause set to hidden clause set
        val clauseToHide = clauseSet.clauses.removeAt(clauseID)
        hiddenClauses.add(clauseToHide)
        newestNode = -1
    }

    /**
     * Show all hidden clauses
     * @param state Current proof state
     */
    fun show() {
        clauseSet.unite(hiddenClauses)
        hiddenClauses.clauses.clear()
        newestNode = -1
    }
}

enum class VisualHelp {
    NONE, HIGHLIGHT, REARRANGE
}
