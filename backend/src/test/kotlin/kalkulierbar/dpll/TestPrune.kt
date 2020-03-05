package kalkulierbar.test.dpll

import kalkulierbar.IllegalMove
import kalkulierbar.dpll.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestPrune {

    val dpll = PropositionalDPLL()

    @Test
    fun testValidPropagatePrune() {
        var state = dpll.parseFormulaToState("c,!a;a", null)
        state = dpll.applyMoveOnState(state, MovePropagate(0, 1, 0, 1))

        assertEquals(3, state.tree.size)
        assertEquals(listOf<Int>(), state.tree[2].children)
        assertEquals(1, state.tree[2].parent)
        assertEquals(true, state.tree[2].isLeaf)
        val clauseSet2 = state.tree[2].diff.apply(state.clauseSet).clone()
        val clauseSet0 = state.tree[0].diff.apply(state.clauseSet).clone()

        // Nothing happens and tests remain the same
        state = dpll.applyMoveOnState(state, MovePrune(2))
        assertEquals(3, state.tree.size)
        assertEquals(listOf<Int>(), state.tree[2].children)
        assertEquals(1, state.tree[2].parent)
        assertEquals(true, state.tree[2].isLeaf)
        assertEquals(clauseSet2.toString(), state.tree[2].diff.apply(state.clauseSet).toString())

        // Annotation Prune fails
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MovePrune(1))
        }

        // Reset to start state
        state = dpll.applyMoveOnState(state, MovePrune(0))
        assertEquals(1, state.tree.size)
        assertEquals(listOf<Int>(), state.tree[0].children)
        assertEquals(true, state.tree[0].isLeaf)
        assertEquals(clauseSet0.toString(), state.tree[0].diff.apply(state.clauseSet).toString())
    }

    @Test
    fun testValidSplitPrune() {
        var state = dpll.parseFormulaToState("a,b;b,c", null)
        state = dpll.applyMoveOnState(state, MoveSplit(0, "b"))
        assertEquals(3, state.tree.size)
        assertEquals(listOf(1,2), state.tree[0].children)
        assertEquals(false, state.tree[0].isLeaf)

        state = dpll.applyMoveOnState(state, MovePrune(0))
        assertEquals(1, state.tree.size)
        assertEquals(listOf<Int>(), state.tree[0].children)
        assertEquals(true, state.tree[0].isLeaf)
    }

    @Test
    fun testValidCheckModelPrune() { // Test for prune not to change something checked true on checked node
        var state = dpll.parseFormulaToState("a,b;a", null)
        state = dpll.applyMoveOnState(state, MovePropagate(0, 1, 0, 0))
        state = dpll.applyMoveOnState(state, MoveModelCheck(2, mapOf("a" to true)))

        assertEquals("model (checked)", state.tree[2].label)
        assertEquals(true, state.tree[2].modelVerified)

        state = dpll.applyMoveOnState(state, MovePrune(2))
        assertEquals("model (checked)", state.tree[2].label)
        assertEquals(true, state.tree[2].modelVerified)
    }

    @Test
    fun testInvalidPrune() {
        var state = dpll.parseFormulaToState("a,b;!a", null)
        state = dpll.applyMoveOnState(state, MovePropagate(0, 1, 0, 0))

        // Out of Bounds
        assertFailsWith<IllegalMove> {
            dpll.applyMoveOnState(state, MovePrune(-1))
        }
        assertFailsWith<IllegalMove> {
            dpll.applyMoveOnState(state, MovePrune(42))
        }
        // Model Node
        assertFailsWith<IllegalMove> {
            dpll.applyMoveOnState(state, MovePrune(1))
        }
    }
}
