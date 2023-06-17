package kalkulierbar.resolution

import kalkulierbar.IllegalMove
import kalkulierbar.IncorrectArityException
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestFactorize {

    private val prop = PropositionalResolution()
    private val fo = FirstOrderResolution()

    @Test
    fun testInvalidClause() {
        val state = prop.parseFormulaToState("a;!a", null)
        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveFactorize(-1, mutableListOf()))
        }

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveFactorize(2, mutableListOf()))
        }

        val fostate = fo.parseFormulaToState("P(c) & R(c) | R(y)", null)
        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(-1, mutableListOf(0, 0)))
        }

        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(2, mutableListOf(0, 1)))
        }
    }

    @Test
    fun testInvalidAtom() {
        val fostate = fo.parseFormulaToState("R(c) | R(y)", null)
        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, mutableListOf(0, 0)))
        }

        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, mutableListOf(-1, 0)))
        }

        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, mutableListOf(2, 0)))
        }

        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, mutableListOf(1, -1)))
        }

        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, mutableListOf(1, 2)))
        }
    }

    @Test
    fun testNothingToFactorize() {
        val state = prop.parseFormulaToState("a;a,b,c", null)
        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveFactorize(0, mutableListOf()))
        }

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveFactorize(1, mutableListOf()))
        }
    }

    @Test
    fun testFactorizeUnificationFail() {
        var fostate = fo.parseFormulaToState("R(c) | R(y)", null)
        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, mutableListOf(0, 1)))
        }

        fostate = fo.parseFormulaToState("\\all X: (R(X) | R(f(X)))", null)
        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(fostate, MoveFactorize(0, mutableListOf(0, 1)))
        }

        assertFailsWith<IncorrectArityException> { fo.parseFormulaToState("\\all X: \\all Y: (R(X,X) | R(Y))", null) }
    }

    @Test
    fun testFactorizeMoveProp() {
        var state = prop.parseFormulaToState("a;a,b,c,a,b,c", null)
        state = prop.applyMoveOnState(state, MoveFactorize(1, mutableListOf()))
        assertEquals(2, state.clauseSet.clauses.size)
        assertEquals("{a, b, c}", state.clauseSet.clauses[1].toString())
    }

    @Test
    fun testFactorizeMoveFo() {
        var fostate = fo.parseFormulaToState("\\all X: (Q(z) | R(X,c) | R(f(c),c) | Q(y))", null)
        fostate = fo.applyMoveOnState(fostate, MoveFactorize(0, mutableListOf(1, 2)))

        assertEquals(2, fostate.clauseSet.clauses.size)
        assertEquals("{Q(z), R(f(c), c), Q(y)}", fostate.clauseSet.clauses[1].toString())
        assertEquals("{Q(z), R(X_1, c), R(f(c), c), Q(y)}", fostate.clauseSet.clauses[0].toString())
    }

    @Test
    fun testFactorizeClausePositioning() {
        var state = prop.parseFormulaToState("a;b,b;c;d;e", null)
        state = prop.applyMoveOnState(state, MoveFactorize(1, mutableListOf()))
        assertEquals("{b}", state.clauseSet.clauses[1].toString())

        var fostate = fo.parseFormulaToState("Q(a) & (R(z) | R(z)) & Q(b) & Q(c)", null)
        fostate = fo.applyMoveOnState(fostate, MoveFactorize(1, mutableListOf(0, 1)))
        assertEquals("{R(z)}", fostate.clauseSet.clauses[4].toString())
        assertEquals("{R(z), R(z)}", fostate.clauseSet.clauses[1].toString())
    }

    @Test
    fun testFactorizeMultiple() {
        var state = fo.parseFormulaToState("/all X: (Q(f(X)) | Q(f(c)) | Q(f(X)))", null)
        state = fo.applyMoveOnState(state, MoveFactorize(0, mutableListOf(0, 1, 2)))
        assertEquals("{Q(f(c))}", state.clauseSet.clauses[1].toString())
    }

    @Test
    fun testFactorizeMultipleInvalid() {
        val state = fo.parseFormulaToState("/all X: (Q(X) | Q(g(c)) | Q(f(X)))", null)

        assertFailsWith<IllegalMove> {
            fo.applyMoveOnState(state, MoveFactorize(0, mutableListOf(0, 1, 2)))
        }
    }
}
