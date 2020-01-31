package kalkulierbar.tests.resolution

import kalkulierbar.IllegalMove
import kalkulierbar.resolution.PropositionalResolution
import kalkulierbar.resolution.ResolutionMove
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestResolutionMove {

    val instance = PropositionalResolution()

    @Test
    fun testDuplicateClause() {
        val state = instance.parseFormulaToState("a;!a", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, ResolutionMove(1, 1, "a"))
        }
    }

    @Test
    fun testClauseIndexOOB() {
        val state = instance.parseFormulaToState("a;!a", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, ResolutionMove(0, 2, "a"))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, ResolutionMove(2, 0, "a"))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, ResolutionMove(-1, 0, "a"))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, ResolutionMove(0, -1, "a"))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, ResolutionMove(512, 0, "a"))
        }
    }

    @Test
    fun testInvalidSpelling() {
        val state = instance.parseFormulaToState("a,b;!a,c", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, ResolutionMove(0, 1, "b"))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, ResolutionMove(0, 1, "c"))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, ResolutionMove(0, 1, "d"))
        }
    }

    @Test
    fun testNonResolvable() {
        val state = instance.parseFormulaToState("!c,a,b;c,a,b", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, ResolutionMove(0, 1, "a"))
        }
    }

    @Test
    fun testValid() {
        var state = instance.parseFormulaToState("!c,a,b;c,a,b", null)
        state = instance.applyMoveOnState(state, ResolutionMove(1, 0, "c"))
        assertEquals("resolutionstate|{a, b}, {!c, a, b}, {c, a, b}||false|0", state.getHash())
    }
}
