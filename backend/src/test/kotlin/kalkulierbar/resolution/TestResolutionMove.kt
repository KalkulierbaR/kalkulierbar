package kalkulierbar.resolution

import kalkulierbar.IllegalMove
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestResolutionMove {

    val instance = PropositionalResolution()

    @Test
    fun testUnsupportedMove() {
        val state = instance.parseFormulaToState("a;!a", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolveUnify(0, 0, 0, 0))
        }
    }

    @Test
    fun testDuplicateClause() {
        val state = instance.parseFormulaToState("a;!a", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolve(1, 1, "a"))
        }
    }

    @Test
    fun testClauseIndexOOB() {
        val state = instance.parseFormulaToState("a;!a", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolve(0, 2, "a"))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolve(2, 0, "a"))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolve(-1, 0, "a"))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolve(0, -1, "a"))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolve(512, 0, "a"))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveHide(2))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveHide(-3))
        }
    }

    @Test
    fun testInvalidSpelling() {
        val state = instance.parseFormulaToState("a,b;!a,c", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolve(0, 1, "b"))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolve(0, 1, "c"))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolve(0, 1, "d"))
        }
    }

    @Test
    fun testNonResolvable() {
        var state = instance.parseFormulaToState("!c,a,b;c,a,b", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolve(0, 1, "a"))
        }

        state = instance.parseFormulaToState("a,b;b,d", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolve(0, 1, null))
        }

        state = instance.parseFormulaToState("a,b;!c,d", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolve(0, 1, null))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveResolve(0, 1, "a"))
        }
    }

    @Test
    fun testValid() {
        var state = instance.parseFormulaToState("!c,a,b;c,a,b", null)
        state = instance.applyMoveOnState(state, MoveResolve(1, 0, "c"))
        assertEquals("resolutionstate|{a, b, a, b}, {!c, a, b}, {c, a, b}||NONE|0", state.getHash())
    }

    @Test
    fun testAutoResolve() {
        var state = instance.parseFormulaToState("a,b,c;a,!b,c", null)
        state = instance.applyMoveOnState(state, MoveResolve(0, 1, null))
        assertEquals("{a, b, c}, {a, c, a, c}, {a, !b, c}", state.clauseSet.toString())
    }

    @Test
    fun testHide() {
        var state = instance.parseFormulaToState("a;b;c;d;e", null)
        assertEquals(5, state.clauseSet.clauses.size)
        assertEquals(0, state.hiddenClauses.clauses.size)
        state = instance.applyMoveOnState(state, MoveHide(2))
        assertEquals(4, state.clauseSet.clauses.size)
        assertEquals(1, state.hiddenClauses.clauses.size)
        state = instance.applyMoveOnState(state, MoveHide(1))
        assertEquals("{a}, {d}, {e}", state.clauseSet.toString())
        assertEquals("{c}, {b}", state.hiddenClauses.toString())
    }

    @Test
    fun testShow() {
        var state = instance.parseFormulaToState("a;b;c;d;e;f;g", null)

        state = instance.applyMoveOnState(state, MoveHide(1))
        state = instance.applyMoveOnState(state, MoveHide(1))
        state = instance.applyMoveOnState(state, MoveHide(1))
        state = instance.applyMoveOnState(state, MoveHide(1))
        state = instance.applyMoveOnState(state, MoveShow())
        assertEquals("{a}, {f}, {g}, {b}, {c}, {d}, {e}", state.clauseSet.toString())
    }
}
