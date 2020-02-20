package kalkulierbar.tests.resolution

import kalkulierbar.IllegalMove
import kalkulierbar.resolution.FirstOrderResolution
import kalkulierbar.resolution.MoveHyper
import kalkulierbar.resolution.PropositionalResolution
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestHyperResolution {

    val prop = PropositionalResolution()
    val fo = FirstOrderResolution()

    @Test
    fun testIndexBoundsChecking() {
        val state = prop.parseFormulaToState("a,!b,!c,!d; b,e; c,f; d,g,h", null)

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveHyper(-1, mapOf()))
        }

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveHyper(4, mapOf()))
        }

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveHyper(0, mapOf(0 to Pair(-1, 0))))
        }

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveHyper(0, mapOf(0 to Pair(4, 0))))
        }

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveHyper(0, mapOf(0 to Pair(1, -1))))
        }

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveHyper(0, mapOf(0 to Pair(1, 2))))
        }

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveHyper(0, mapOf(-1 to Pair(1, 0))))
        }
    }

    @Test
    fun testEmptySidePremiss() {
        val state = prop.parseFormulaToState("a,!b,!c,!d; b,e; c,f; d,g,h", null)

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveHyper(0, mapOf()))
        }
    }

    @Test
    fun testNegativityConstraintA() {
        val state = prop.parseFormulaToState("a,!b,!c,!d; b,e,!f; c; d", null)

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveHyper(0, mapOf(1 to Pair(1, 0))))
        }

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveHyper(0, mapOf(2 to Pair(2, 0), 1 to Pair(1, 0), 3 to Pair(3, 0))))
        }
    }

    @Test
    fun testNegativityConstraintB() {
        val state = prop.parseFormulaToState("a,!b,c,!d; b,e,f; !c; d", null)

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveHyper(0, mapOf(2 to Pair(2, 0), 1 to Pair(1, 0), 3 to Pair(3, 0))))
        }
    }

    @Test
    fun testNegativityConstraintC() {
        val state = prop.parseFormulaToState("a,!b,!c,!d; b,e; c;", null)

        assertFailsWith<IllegalMove> {
            prop.applyMoveOnState(state, MoveHyper(0, mapOf(2 to Pair(2, 0), 1 to Pair(1, 0))))
        }
    }

    @Test
    fun testValidA() {
        var state = prop.parseFormulaToState("a,!b,!c,!d; b,e; c,f; g,d,h", null)
        state = prop.applyMoveOnState(state, MoveHyper(0, mapOf(2 to Pair(2, 0), 1 to Pair(1, 0), 3 to Pair(3, 1))))

        assertEquals("{a, !b, !c, !d}, {b, e}, {c, f}, {g, d, h}, {a, f, e, g, h}", state.clauseSet.toString())
    }

    @Test
    fun testValidB() {
        var state = prop.parseFormulaToState("a,!b,c,d; e,f,b,g", null)
        state = prop.applyMoveOnState(state, MoveHyper(0, mapOf(1 to Pair(1, 2))))

        assertEquals("{a, !b, c, d}, {e, f, b, g}, {a, c, d, e, f, g}", state.clauseSet.toString())
    }
}
