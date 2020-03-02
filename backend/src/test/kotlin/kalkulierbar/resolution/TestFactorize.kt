package kalkulierbar.tests.resolution

import kalkulierbar.IllegalMove
import kalkulierbar.resolution.FirstOrderResolution
import kalkulierbar.resolution.MoveFactorize
import kalkulierbar.resolution.PropositionalResolution
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestFactorize {

    val prop = PropositionalResolution()
    val fo = FirstOrderResolution()

    @Test
    fun testInvalidClause() {
        val state = prop.parseFormulaToState("a;!a", null)
        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveFactorize(-1))
        }

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveFactorize(2))
        }

        val fostate = fo.parseFormulaToState("P(c) & R(c) | R(y)", null)
        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(-1, 0, 0))
        }

        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(2, 0, 1))
        }
    }

    @Test
    fun testInvalidAtom() {
        val fostate = fo.parseFormulaToState("R(c) | R(y)", null)
        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, 0, 0))
        }

        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, -1, 0))
        }

        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, 2, 0))
        }

        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, 1, -1))
        }

        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, 1, 2))
        }
    }

    @Test
    fun testNothingToFactorize() {
        val state = prop.parseFormulaToState("a;a,b,c", null)
        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveFactorize(0))
        }

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveFactorize(1))
        }
    }

    @Test
    fun testFactorizeUnificationFail() {
        var fostate = fo.parseFormulaToState("R(c) | R(y)", null)
        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, 0, 1))
        }

        fostate = fo.parseFormulaToState("\\all X: (R(X) | R(f(X)))", null)
        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, 0, 1))
        }

        fostate = fo.parseFormulaToState("\\all X: \\all Y: (R(X,X) | R(Y))", null)
        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, 0, 1))
        }
    }

    @Test
    fun testFactorizeMoveProp() {
        var state = prop.parseFormulaToState("a;a,b,c,a,b,c", null)
        state = prop.applyMoveOnState(state, MoveFactorize(1))
        assertEquals(2, state.clauseSet.clauses.size)
        assertEquals("{a, b, c}", state.clauseSet.clauses[1].toString())
    }

    @Test
    fun testFactorizeMoveFo() {
        var fostate = fo.parseFormulaToState("\\all X: (Q(z) | R(X,c) | R(f(c),c) | Q(y))", null)
        fostate = fo.applyMoveOnState(fostate, MoveFactorize(0, 1, 2))

        assertEquals(1, fostate.hiddenClauses.clauses.size)
        assertEquals(1, fostate.clauseSet.clauses.size)
        assertEquals("{Q(z), R(f(c), c), Q(y)}", fostate.clauseSet.clauses[0].toString())
        assertEquals("{Q(z), R(X_1, c), R(f(c), c), Q(y)}", fostate.hiddenClauses.clauses[0].toString())
    }

    @Test
    fun testFactorizeClausePositioning() {
        var state = prop.parseFormulaToState("a;b,b;c;d;e", null)
        state = prop.applyMoveOnState(state, MoveFactorize(1))
        assertEquals("{b}", state.clauseSet.clauses[1].toString())

        var fostate = fo.parseFormulaToState("Q(a) & (R(z) | R(z)) & Q(b) & Q(c)", null)
        fostate = fo.applyMoveOnState(fostate, MoveFactorize(1, 0, 1))
        assertEquals("{R(z)}", fostate.clauseSet.clauses[1].toString())
    }
}
