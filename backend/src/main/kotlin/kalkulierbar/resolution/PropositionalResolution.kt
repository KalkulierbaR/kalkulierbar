package main.kotlin.kalkulierbar.resolution

import kalkulierbar.*
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kalkulierbar.parsers.ClauseSetParser
import kotlinx.serialization.MissingFieldException
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import kotlinx.serialization.UnstableDefault
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonDecodingException

class PropositionalResolution : JSONCalculus<ResolutionState, ResolutionMove, Any>() {
    override val identifier = "prop-resolution"

    override fun parseFormulaToState(formula: String, params: Any?): ResolutionState {
        val parsed = ClauseSetParser.parse(formula)
        return ResolutionState(parsed)
    }

    override fun applyMoveOnState(state: ResolutionState, move: ResolutionMove): ResolutionState {
        val cId1 = move.c1
        val cId2 = move.c2
        val clauses = state.clauseSet.clauses
        val spelling = move.spelling

        // Verify that the clause ids are valid
        if (cId1 == cId2)
            throw IllegalMove("Same clauses")
        if (cId1 < 0 || cId1 >= clauses.size)
            throw IllegalMove("There is no clause with id $cId1")
        if (cId2 < 0 || cId2 >= clauses.size)
            throw IllegalMove("There is no clause with id $cId2")

        val c1 = clauses[cId1]
        val c2 = clauses[cId2]

        val atomsInC1 = c1.atoms.filter { it.lit == spelling }
        val atomsInC2 = c2.atoms.filter { it.lit == spelling }
        if (atomsInC1.isEmpty())
            throw IllegalMove("Error 1")
        if (atomsInC2.isEmpty())
            throw IllegalMove("Error 2")

        val (a1, a2) = findResCandidates(atomsInC1, atomsInC2) ?: throw IllegalMove("No Candidates found")

        clauses.add(buildClause(c1, a1, c2, a2))

        return state
    }

    private fun findResCandidates(atoms1: List<Atom>, atoms2: List<Atom>): Pair<Atom, Atom>? {
        val (pos, neg) = atoms2.partition { !it.negated }

        for (a1 in atoms1) {
            val other = if (a1.negated) pos else neg;
            if (other.isEmpty())
                continue
            val a2 = other[0]
            return Pair(a1, a2)
        }

        return null
    }

    private fun buildClause(c1: Clause, a1: Atom, c2: Clause, a2: Atom): Clause {
        val atoms = c1.atoms.filter { it.lit != a1.lit || it.negated != a1.negated }.toMutableList() +
                c2.atoms.filter { it.lit != a2.lit || it.negated != a2.negated }.toMutableList()
        return Clause(atoms.distinct().toMutableList())
    }

    override fun checkCloseOnState(state: ResolutionState): CloseMessage {
        val hasEmptyClause = state.clauseSet.clauses.any { it.atoms.isEmpty() }
        val msg = if (hasEmptyClause) "The proof is closed." else "The proof is not closed."
        return CloseMessage(hasEmptyClause, "The proof is closed.")
    }

    @UnstableDefault
    override fun jsonToState(json: String): ResolutionState {
        try {
            val parsed = Json.parse(ResolutionState.serializer(), json)

            // Ensure valid, unmodified state object
            if (!parsed.verifySeal())
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

            return parsed
        } catch (e: JsonDecodingException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state")
        } catch (e: MissingFieldException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state - missing field")
        } catch (e: SerializationException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state")
        } catch (e: NumberFormatException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state - invalid number format")
        }
    }

    @UnstableDefault
    override fun stateToJson(state: ResolutionState): String {
        state.computeSeal()
        return Json.stringify(ResolutionState.serializer(), state)
    }

    @UnstableDefault
    override fun jsonToMove(json: String): ResolutionMove {
        try {
            return Json.parse(ResolutionMove.serializer(), json)
        } catch (e: JsonDecodingException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move")
        } catch (e: MissingFieldException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move - missing field")
        } catch (e: SerializationException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move")
        } catch (e: NumberFormatException) {
            throw JsonParseException(e.message ?: "Could not parse JSON move - invalid number format")
        }
    }

    override fun jsonToParam(json: String): Any {
        return 0
    }
}

@Serializable
class ResolutionState(val clauseSet: ClauseSet) {
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
     * Verify the state object checksum
     * Call after importing state
     * @return true iff the current seal is valid
     */
    fun verifySeal() = TamperProtect.verify(getHash(), seal)

    /**
     * Pack the state into a well-defined, unambiguous string representation
     * Used to calculate checksums over state objects as JSON representation
     * might differ slightly between clients, encodings, etc
     * @return Canonical state representation
     */
    fun getHash(): String {
        val clauseSetHash = clauseSet.toString()
        return "resolutionstate|$clauseSetHash"
    }
}

@Serializable
data class ResolutionMove(val c1: Int, val c2: Int, val spelling: String)
