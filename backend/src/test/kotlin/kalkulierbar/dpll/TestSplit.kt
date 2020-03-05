package kalkulierbar.tests.dpll

import kalkulierbar.IllegalMove
import kalkulierbar.dpll.MovePropagate
import kalkulierbar.dpll.MoveSplit
import kalkulierbar.dpll.NodeType
import kalkulierbar.dpll.PropositionalDPLL
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestSplit {

    val dpll = PropositionalDPLL()

    @Test
    fun testValidSingleClause() {
        var state = dpll.parseFormulaToState("!a,b,c", null)
        state = dpll.applyMoveOnState(state, MoveSplit(0, "!a"))

        assertEquals(3, state.tree.size)

        assertEquals("true", state.tree[0].label)
        assertEquals("!a", state.tree[1].label)
        assertEquals("¬!a", state.tree[2].label)

        assertEquals(NodeType.ROOT, state.tree[0].type)
        assertEquals(NodeType.SPLIT, state.tree[1].type)
        assertEquals(NodeType.SPLIT, state.tree[2].type)

        assertEquals(listOf(1, 2), state.tree[0].children)
        assertEquals(0, state.tree[1].parent)
        assertEquals(0, state.tree[2].parent)

        assertEquals(false, state.tree[0].isLeaf)
        assertEquals(true, state.tree[1].isLeaf)
        assertEquals(true, state.tree[2].isLeaf)

        assertEquals("[{!a, b, c}, {!a}]", state.tree[1].diff.apply(state.clauseSet).clauses.toString())
        assertEquals("[{!a, b, c}, {!!a}]", state.tree[2].diff.apply(state.clauseSet).clauses.toString())
    }

    @Test
    fun testValidSingleAtom() {
        // TODO: Abändern nach Korrigierung parsing
        var state = dpll.parseFormulaToState("!a;b,c;b", null)
        state = dpll.applyMoveOnState(state, MoveSplit(0, "This does not make any sense"))
        state = dpll.applyMoveOnState(state, MoveSplit(1, "This neither"))

        assertEquals(5, state.tree.size)

        assertEquals("true", state.tree[0].label)
        assertEquals("This does not make any sense", state.tree[1].label)
        assertEquals("¬This does not make any sense", state.tree[2].label)
        assertEquals("This neither", state.tree[3].label)
        assertEquals("¬This neither", state.tree[4].label)

        assertEquals(listOf(1, 2), state.tree[0].children)
        assertEquals(0, state.tree[1].parent)
        assertEquals(0, state.tree[2].parent)
        assertEquals(listOf(3, 4), state.tree[1].children)
        assertEquals(1, state.tree[3].parent)
        assertEquals(1, state.tree[4].parent)

        assertEquals(false, state.tree[0].isLeaf)
        assertEquals(false, state.tree[1].isLeaf)
        assertEquals(true, state.tree[2].isLeaf)
        assertEquals(true, state.tree[3].isLeaf)
        assertEquals(true, state.tree[4].isLeaf)

        assertEquals("[{!a}, {b, c}, {b}, {This does not make any sense}]",
                state.tree[1].diff.apply(state.clauseSet).clauses.toString())
        assertEquals("[{!a}, {b, c}, {b}, {!This does not make any sense}]",
                state.tree[2].diff.apply(state.clauseSet).clauses.toString())
        assertEquals("[{!a}, {b, c}, {b}, {This neither}]",
                state.tree[3].diff.apply(state.clauseSet).clauses.toString())
        assertEquals("[{!a}, {b, c}, {b}, {!This neither}]",
                state.tree[4].diff.apply(state.clauseSet).clauses.toString())
    }

    @Test
    fun testValidEmpty() {
        var state = dpll.parseFormulaToState("a,b,c", null)
        state = dpll.applyMoveOnState(state, MoveSplit(0, ""))

        assertEquals("true", state.tree[0].label)
        assertEquals("", state.tree[1].label)
        assertEquals("¬", state.tree[2].label)

        assertEquals(NodeType.ROOT, state.tree[0].type)
        assertEquals(NodeType.SPLIT, state.tree[1].type)
        assertEquals(NodeType.SPLIT, state.tree[2].type)

        assertEquals(listOf(1, 2), state.tree[0].children)
        assertEquals(0, state.tree[1].parent)
        assertEquals(0, state.tree[2].parent)

        assertEquals(false, state.tree[0].isLeaf)
        assertEquals(true, state.tree[1].isLeaf)
        assertEquals(true, state.tree[2].isLeaf)

        assertEquals("[{a, b, c}, {}]", state.tree[1].diff.apply(state.clauseSet).clauses.toString())
        assertEquals("[{a, b, c}, {!}]", state.tree[2].diff.apply(state.clauseSet).clauses.toString())
    }

    @Test
    fun testInvalid() {
        var state = dpll.parseFormulaToState("a;a,b,c", null)

        // Out of bounds
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MoveSplit(-1, "a"))
        }
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MoveSplit(1, "a"))
        }
        // Conflicts
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MoveSplit(0, "a"))
            // Split on same twice
            state = dpll.applyMoveOnState(state, MoveSplit(0, "b"))
        }
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MovePropagate(0, 0, 1, 0))
            // Split Annotation
            state = dpll.applyMoveOnState(state, MoveSplit(2, "b"))
        }
    }
}
