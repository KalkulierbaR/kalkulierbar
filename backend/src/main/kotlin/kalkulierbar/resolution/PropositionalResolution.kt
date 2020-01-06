package kalkulierbar.resolution

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kalkulierbar.parsers.CnfStrategy
import kalkulierbar.parsers.FlexibleClauseSetParser
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.MissingFieldException
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import kotlinx.serialization.UnstableDefault
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonDecodingException

class PropositionalResolution : JSONCalculus<ResolutionState, ResolutionMove, ResolutionParam>() {
    override val identifier = "prop-resolution"

    override fun parseFormulaToState(formula: String, params: ResolutionParam?): ResolutionState {
        val parsed = if (params == null)
            FlexibleClauseSetParser.parse(formula)
        else
            FlexibleClauseSetParser.parse(formula, params.cnfStrategy)

        return ResolutionState(parsed, params?.highlightSelectable ?: false)
    }

    override fun applyMoveOnState(state: ResolutionState, move: ResolutionMove): ResolutionState {
        val cId1 = move.c1
        val cId2 = move.c2
        val clauses = state.clauseSet.clauses
        val spelling = move.spelling

        // Verify that the clause ids are valid
        if (cId1 == cId2)
            throw IllegalMove("Both ids refer to the same clause")
        if (cId1 < 0 || cId1 >= clauses.size)
            throw IllegalMove("There is no clause with id $cId1")
        if (cId2 < 0 || cId2 >= clauses.size)
            throw IllegalMove("There is no clause with id $cId2")

        val c1 = clauses[cId1]
        val c2 = clauses[cId2]

        // Filter clauses for atoms with correct spelling
        val atomsInC1 = c1.atoms.filter { it.lit == spelling }
        val atomsInC2 = c2.atoms.filter { it.lit == spelling }
        if (atomsInC1.isEmpty())
            throw IllegalMove("Clause ${clauses[cId1]} does not contain atoms with spelling $spelling")
        if (atomsInC2.isEmpty())
            throw IllegalMove("Clause ${clauses[cId2]} does not contain atoms with spelling $spelling")

        val msg = """Clauses ${clauses[cId1]} and ${clauses[cId2]} do not contain
                    |atom $spelling in both positive and negated form"""
        val (a1, a2) = findResCandidates(atomsInC1, atomsInC2)
                ?: throw IllegalMove(msg)

        // Add the new node where the second one was. This should be pretty nice for the user
        state.newestNode = cId2

        clauses.add(state.newestNode, buildClause(c1, a1, c2, a2))

        return state
    }

    /**
     * Searches two atom lists for resolution candidates and returns the first.
     * The lists have to be filtered for the spelling already.
     * @param atoms1 The first list of atoms
     * @param atoms2 The second list of atoms
     * @return A pair of the two atoms for resolution.
     */
    private fun findResCandidates(atoms1: List<Atom>, atoms2: List<Atom>): Pair<Atom, Atom>? {
        val (pos, neg) = atoms2.partition { !it.negated }

        for (a1 in atoms1) {
            val other = if (a1.negated) pos else neg
            if (other.isEmpty())
                continue
            val a2 = other[0]
            return Pair(a1, a2)
        }

        return null
    }

    /**
     * Builds a new clause according to resolution.
     * @param c1 The first clause for resolution
     * @param a1 The atom to filter out of c1
     * @param c2 The second clause for resolution
     * @param a2 The atom to filter out of c2
     * @return A new clause that contains all elements of c1 and c2 except for a1 and a2
     */
    private fun buildClause(c1: Clause, a1: Atom, c2: Clause, a2: Atom): Clause {
        val atoms = c1.atoms.filter { it != a1 }.toMutableList() +
                c2.atoms.filter { it != a2 }.toMutableList()
        return Clause(atoms.distinct().toMutableList())
    }

    override fun checkCloseOnState(state: ResolutionState): CloseMessage {
        val hasEmptyClause = state.clauseSet.clauses.any { it.atoms.isEmpty() }
        val msg = if (hasEmptyClause) "The proof is closed" else "The proof is not closed"
        return CloseMessage(hasEmptyClause, msg)
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
            throw JsonParseException(e.message
                    ?: "Could not parse JSON state - missing field")
        } catch (e: SerializationException) {
            throw JsonParseException(e.message ?: "Could not parse JSON state")
        } catch (e: NumberFormatException) {
            throw JsonParseException(e.message
                    ?: "Could not parse JSON state - invalid number format")
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
     * Parses a JSON parameter representation into a ResolutionParam object
     * @param json JSON parameter representation
     * @return parsed param object
     */
    @UnstableDefault
    override fun jsonToParam(json: String): ResolutionParam {
        try {
            return Json.parse(ResolutionParam.serializer(), json)
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

    override fun getDocumentation(): String {
        return """Takes a clause set as an input, format a,!b;b,!c;d with variables in [a-zA-Z]+
            |There is only one move, the resolution move of the following JSON format:
            |{ c1: <ID of first clause>, c2: <ID of second clause>, spelling: <The literal on which the resolution is done> }
            |where IDs are the position of the clause in the clause list.
        """.trimMargin()
    }
}

@Serializable
class ResolutionState(val clauseSet: ClauseSet, val highlightSelectable: Boolean) : ProtectedState() {
    var newestNode = -1

    override var seal = ""

    override fun getHash(): String {
        val clauseSetHash = clauseSet.toString()
        return "resolutionstate|$clauseSetHash|$highlightSelectable|$newestNode"
    }
}

@Serializable
data class ResolutionMove(val c1: Int, val c2: Int, val spelling: String)

@Serializable
data class ResolutionParam(val cnfStrategy: CnfStrategy, val highlightSelectable: Boolean)
