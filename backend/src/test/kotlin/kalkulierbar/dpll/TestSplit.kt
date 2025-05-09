package kalkulierbar.dpll

import kalkulierbar.IllegalMove
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestSplit {
    private val dpll = DPLL()

    @Test
    fun testValidSingleClause() {
        var state = dpll.parseFormulaToState("!a,b,c", null)
        state = dpll.applyMoveOnState(state, MoveSplit(0, "c"))

        assertEquals(3, state.tree.size)

        assertEquals("true", state.tree[0].label)
        assertEquals("c", state.tree[1].label)
        assertEquals("¬c", state.tree[2].label)

        assertEquals(NodeType.ROOT, state.tree[0].type)
        assertEquals(NodeType.SPLIT, state.tree[1].type)
        assertEquals(NodeType.SPLIT, state.tree[2].type)

        assertEquals(listOf(1, 2), state.tree[0].children)
        assertEquals(0, state.tree[1].parent)
        assertEquals(0, state.tree[2].parent)

        assertEquals(false, state.tree[0].isLeaf)
        assertEquals(true, state.tree[1].isLeaf)
        assertEquals(true, state.tree[2].isLeaf)

        assertEquals(
            "[{!a, b, c}, {c}]",
            state.tree[1]
                .diff
                .apply(state.clauseSet)
                .clauses
                .toString(),
        )
        assertEquals(
            "[{!a, b, c}, {!c}]",
            state.tree[2]
                .diff
                .apply(state.clauseSet)
                .clauses
                .toString(),
        )
    }

    @Test
    fun testValidSingleAtom() {
        var state = dpll.parseFormulaToState("!a;b,c;b", null)
        state = dpll.applyMoveOnState(state, MoveSplit(0, "a"))
        state = dpll.applyMoveOnState(state, MoveSplit(1, "b"))

        assertEquals(5, state.tree.size)

        assertEquals("true", state.tree[0].label)
        assertEquals("a", state.tree[1].label)
        assertEquals("¬a", state.tree[2].label)
        assertEquals("b", state.tree[3].label)
        assertEquals("¬b", state.tree[4].label)

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

        assertEquals(
            "[{!a}, {b, c}, {b}, {a}]",
            state.tree[1]
                .diff
                .apply(state.clauseSet)
                .clauses
                .toString(),
        )
        assertEquals(
            "[{!a}, {b, c}, {b}, {!a}]",
            state.tree[2]
                .diff
                .apply(state.clauseSet)
                .clauses
                .toString(),
        )
        assertEquals(
            "[{!a}, {b, c}, {b}, {b}]",
            state.tree[3]
                .diff
                .apply(state.clauseSet)
                .clauses
                .toString(),
        )
        assertEquals(
            "[{!a}, {b, c}, {b}, {!b}]",
            state.tree[4]
                .diff
                .apply(state.clauseSet)
                .clauses
                .toString(),
        )
    }

    @Test
    fun testValidNumber() {
        var state = dpll.parseFormulaToState("a,b,c", null)
        state = dpll.applyMoveOnState(state, MoveSplit(0, "42"))

        assertEquals("true", state.tree[0].label)
        assertEquals("42", state.tree[1].label)
        assertEquals("¬42", state.tree[2].label)

        assertEquals(NodeType.ROOT, state.tree[0].type)
        assertEquals(NodeType.SPLIT, state.tree[1].type)
        assertEquals(NodeType.SPLIT, state.tree[2].type)

        assertEquals(listOf(1, 2), state.tree[0].children)
        assertEquals(0, state.tree[1].parent)
        assertEquals(0, state.tree[2].parent)

        assertEquals(false, state.tree[0].isLeaf)
        assertEquals(true, state.tree[1].isLeaf)
        assertEquals(true, state.tree[2].isLeaf)

        assertEquals(
            "[{a, b, c}, {42}]",
            state.tree[1]
                .diff
                .apply(state.clauseSet)
                .clauses
                .toString(),
        )
        assertEquals(
            "[{a, b, c}, {!42}]",
            state.tree[2]
                .diff
                .apply(state.clauseSet)
                .clauses
                .toString(),
        )
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
        // Wrong parsing
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MoveSplit(0, ""))
        }
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MoveSplit(0, "This is nonsense"))
        }
        assertFailsWith<IllegalMove> {
            state = dpll.applyMoveOnState(state, MoveSplit(0, "HELLO"))
        }
    }
}
