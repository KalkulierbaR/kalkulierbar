package kalkulierbar.tests.resolution

import kalkulierbar.IllegalMove
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.resolution.MoveFactorize
import kalkulierbar.resolution.PropositionalResolution
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestFactorize {

    val instance = PropositionalResolution()

    @Test
    fun testClauseFactorize() {
        val a = Clause<String>(mutableListOf(Atom("a"), Atom("b"), Atom("a"), Atom("b"), Atom("a")))
        val b = Clause<String>(mutableListOf(Atom("a"), Atom("b"), Atom("c"), Atom("a"), Atom("c")))
        val c = Clause<String>(mutableListOf(Atom("a"), Atom("a"), Atom("a"), Atom("a"), Atom("a")))
        a.factorize()
        b.factorize()
        c.factorize()

        assertEquals("{a, b}", a.toString())
        assertEquals("{a, b, c}", a.toString())
        assertEquals("{a}", c.toString())
    }

    @Test
    fun testInvalidClause() {
        val state = instance.parseFormulaToState("a;!a", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveFactorize(-1, null, null))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveFactorize(2, null, null))
        }
    }

    @Test
    fun testNothingToFactorize() {
        val state = instance.parseFormulaToState("a;a,b,c", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveFactorize(0, null, null))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveFactorize(1, null, null))
        }
    }

    @Test
    fun testFactorizeMove() {
        var state = instance.parseFormulaToState("a;a,b,c,a,b,c", null)
        state = instance.applyMoveOnState(state, MoveFactorize(1, null, null))

        assertEquals(1, state.hiddenClauses.clauses.size)
        assertEquals(2, state.clauseSet.clauses.size)
        assertEquals("{a, b, c}", state.clauseSet.clauses[1].toString())
        assertEquals("{a, b, c, a, b, c}", state.hiddenClauses.clauses[1].toString())
    }

    @Test
    fun testFactorizeClausePositioning() {
        var state = instance.parseFormulaToState("a;b,b;c;d;e", null)
        state = instance.applyMoveOnState(state, MoveFactorize(1, null, null))

        assertEquals("{b}", state.clauseSet.clauses[1].toString())
    }
}
