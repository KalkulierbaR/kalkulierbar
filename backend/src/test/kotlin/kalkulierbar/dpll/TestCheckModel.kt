package kalkulierbar.dpll

import kalkulierbar.IllegalMove
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestCheckModel {

    val dpll = DPLL()

    @Test
    fun testCheckModel1() {
        var state = dpll.parseFormulaToState("a,b;a", null)
        state = dpll.applyMoveOnState(state, MovePropagate(0, 1, 0, 0))
        assertEquals("model", state.tree[2].label)
        assertEquals(null, state.tree[2].modelVerified)

        assertFailsWith<IllegalMove> {
            dpll.applyMoveOnState(state, MoveModelCheck(2, mapOf("a" to false)))
        }

        state = dpll.applyMoveOnState(state, MoveModelCheck(2, mapOf("a" to true)))
        assertEquals("model ✓", state.tree[2].label)
        assertEquals(true, state.tree[2].modelVerified)

        val closeMessage = dpll.checkCloseOnState(state)
        assertEquals(false, closeMessage.closed)
    }

    @Test
    fun testCheckModel2() {
        var state = dpll.parseFormulaToState("a,b;!a", null)
        state = dpll.applyMoveOnState(state, MovePropagate(0, 1, 0, 0))

        assertFailsWith<IllegalMove> {
            dpll.applyMoveOnState(state, MoveModelCheck(2, mapOf("a" to false)))
        }

        state = dpll.applyMoveOnState(state, MoveModelCheck(2, mapOf("a" to false, "b" to true)))
        assertEquals("model ✓", state.tree[2].label)
        assertEquals(true, state.tree[2].modelVerified)

        assertFailsWith<IllegalMove> { // Doubled check
            state = dpll.applyMoveOnState(state, MoveModelCheck(2, mapOf("a" to false, "b" to true)))
        }

        val closeMessage = dpll.checkCloseOnState(state)
        assertEquals(false, closeMessage.closed)
    }

    @Test
    fun testCheckModelUnsatisfiable() {
        var state = dpll.parseFormulaToState("a;!a", null)
        state = dpll.applyMoveOnState(state, MovePropagate(0, 0, 1, 0))

        assertEquals(3, state.tree.size)
        assertEquals("prop", state.tree[1].label)
        assertEquals("closed", state.tree[2].label)

        val closeMessage = dpll.checkCloseOnState(state)
        assertEquals(true, closeMessage.closed)
    }

    @Test
    fun testInvalidModelCheck() {
        var state = dpll.parseFormulaToState("a,b;a", null)
        state = dpll.applyMoveOnState(state, MovePropagate(0, 1, 0, 0))

        // Out of bounds
        assertFailsWith<IllegalMove> {
            dpll.applyMoveOnState(state, MoveModelCheck(-1, mapOf("a" to true)))
        }
        assertFailsWith<IllegalMove> {
            dpll.applyMoveOnState(state, MoveModelCheck(3, mapOf("a" to true)))
        }
        // Problem
        assertFailsWith<IllegalMove> { // Empty map
            dpll.applyMoveOnState(state, MoveModelCheck(2, mapOf()))
        }
        assertFailsWith<IllegalMove> { // Not model node
            dpll.applyMoveOnState(state, MoveModelCheck(0, mapOf("a" to true)))
        }
        assertFailsWith<IllegalMove> { // Not model node
            dpll.applyMoveOnState(state, MoveModelCheck(1, mapOf("a" to true)))
        }
    }
}
