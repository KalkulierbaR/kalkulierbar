package kalkulierbar.resolution

import kalkulierbar.IllegalMove

/**
 * Checks that all IDs for a hyper resolution are valid
 * @param state Current proof state
 * @param clauseID ID of main premiss
 * @param atomMap Maps an atom of the main premiss to an atom of a side premiss
 */
@Suppress("ThrowsCount")
fun <AtomType> checkHyperID(state: GenericResolutionState<AtomType>, clauseID: Int, atomMap: Map<Int, Pair<Int, Int>>) {
    val clauses = state.clauseSet.clauses

    // Check for valid clause id
    if (clauseID < 0 || clauseID >= clauses.size) {
        throw IllegalMove("There is no (main premiss) clause with id $clauseID")
    }
    val mainPremiss = clauses[clauseID].atoms
    // Check that (mainAtomID -> (sideClauseID, atomID)) map elements are correct
    for ((mAtomID, pair) in atomMap) {
        val (sClauseID, sAtomID) = pair

        if (mAtomID < 0 || mAtomID >= mainPremiss.size) {
            throw IllegalMove("There is no atom with id $mAtomID in (main premiss) clause ${clauses[clauseID]}")
        }
        if (sClauseID < 0 || sClauseID >= clauses.size) {
            throw IllegalMove("There is no (side premiss) clause with id $sClauseID")
        }
        val clause = clauses[sClauseID].atoms
        if (sAtomID < 0 || sAtomID >= clause.size) {
            throw IllegalMove("There is no atom with id $sAtomID in (side premiss) clause $clause")
        }
    }
}

@Suppress("ThrowsCount")
fun resolveCheckID(state: FoResolutionState, c1: Int, c2: Int, c1lit: Int, c2lit: Int) {
    if (c1 < 0 || c1 >= state.clauseSet.clauses.size) {
        throw IllegalMove("There is no clause with id $c1")
    }
    if (c2 < 0 || c2 >= state.clauseSet.clauses.size) {
        throw IllegalMove("There is no clause with id $c1")
    }

    val clause1 = state.clauseSet.clauses[c1]
    val clause2 = state.clauseSet.clauses[c2]

    if (c1lit < 0 || c1lit >= clause1.atoms.size) {
        throw IllegalMove("Clause $clause1 has no atom with index $c1lit")
    }
    if (c2lit < 0 || c2lit >= clause2.atoms.size) {
        throw IllegalMove("Clause $clause2 has no atom with index $c2lit")
    }
}
