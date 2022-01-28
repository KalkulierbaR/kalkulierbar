package kalkulierbar.dpll

import kalkulierbar.IllegalMove
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestPropagate {

    private val dpll = DPLL()

    @Test
    fun testValidDiffers() {
        var state = dpll.parseFormulaToState("a;!a,b,c", null)
        state = dpll.applyMoveOnState(state, MovePropagate(0, 0, 1, 0))

        assertEquals("{b, c}", state.tree[1].diff.apply(state.clauseSet).clauses[1].toString())
        assertEquals(NodeType.PROP, state.tree[1].type)
    }

    @Test
    fun testValidEquals() {
        var state = dpll.parseFormulaToState("a;a,b,c", null)
        state = dpll.applyMoveOnState(state, MovePropagate(0, 0, 1, 0))

        assertEquals("{a}", state.tree[1].diff.apply(state.clauseSet).clauses[0].toString())
        assertEquals(3, state.tree.size)
        assertEquals(NodeType.MODEL, state.tree[2].type)
    }

    @Test
    fun testValidMany() {
        var state = dpll.parseFormulaToState("a;!a,b;a,c", null)
        state = dpll.applyMoveOnState(state, MovePropagate(0, 0, 1, 0))
        state = dpll.applyMoveOnState(state, MovePropagate(1, 0, 2, 0))

        assertEquals(4, state.tree.size)
        assertEquals(null, state.tree[0].parent)
        assertEquals(0, state.tree[1].parent)
        assertEquals(1, state.tree[2].parent)
        assertEquals(2, state.tree[3].parent)

        assertEquals(mutableListOf(1), state.tree[0].children)
        assertEquals(mutableListOf(2), state.tree[1].children)
        assertEquals(mutableListOf(3), state.tree[2].children)
        assertEquals(mutableListOf(), state.tree[3].children)

        assertEquals(false, state.tree[0].isLeaf)
        assertEquals(false, state.tree[1].isLeaf)
        assertEquals(false, state.tree[2].isLeaf)
        assertEquals(true, state.tree[3].isLeaf)

        assertEquals(false, state.tree[0].isAnnotation)
        assertEquals(false, state.tree[1].isAnnotation)
        assertEquals(false, state.tree[2].isAnnotation)
        assertEquals(true, state.tree[3].isAnnotation)

        assertEquals("true", state.tree[0].label)
        assertEquals("prop", state.tree[1].label)
        assertEquals("prop", state.tree[2].label)
        assertEquals("model", state.tree[3].label)

        assertEquals("[{a}, {!a, b}, {a, c}]", state.tree[0].diff.apply(state.clauseSet).clauses.toString())
        assertEquals("[{a}, {b}, {a, c}]", state.tree[1].diff.apply(state.clauseSet).clauses.toString())
        val newClauseSet = state.tree[1].diff.apply(state.clauseSet)
        assertEquals("[{a}, {b}]", state.tree[2].diff.apply(newClauseSet).clauses.toString())
    }

    @Test
    fun testValidClosed() {
        var state = dpll.parseFormulaToState("a;!a;a,b", null)
        state = dpll.applyMoveOnState(state, MovePropagate(0, 0, 1, 0))

        assertEquals(NodeType.CLOSED, state.tree[2].type)
    }

    @Test
    fun testInvalid() {
        var state = dpll.parseFormulaToState("a;!a,b;a,c", null)
        // Out of bounds
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MovePropagate(-1, 0, 1, 0))
        }
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MovePropagate(0, -1, 1, 0))
        }
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MovePropagate(0, 0, -1, 0))
        }
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MovePropagate(0, 0, 1, -1))
        }
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MovePropagate(101, 0, 1, 0))
        }
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MovePropagate(0, 101, 1, 0))
        }
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MovePropagate(0, 0, 101, 0))
        }
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MovePropagate(0, 0, 1, 101))
        }
        // Conflicts
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MovePropagate(0, 0, 1, 0))
            // Same branch twice
            state = dpll.applyMoveOnState(state, MovePropagate(0, 0, 2, 0))
        }
        assertFailsWith<IllegalMove> { // Propagate Annotation
            dpll.applyMoveOnState(state, MovePropagate(0, 0, 1, 0))
            dpll.applyMoveOnState(state, MovePropagate(2, 0, 1, 0))
        }
        assertFailsWith<IllegalMove> {
            // Base clause with 2 objects
            state = dpll.applyMoveOnState(state, MovePropagate(0, 1, 1, 0))
        }
        assertFailsWith<IllegalMove> {
            // Wrong prop atom
            state = dpll.applyMoveOnState(state, MovePropagate(0, 0, 1, 1))
        }
    }
}
