package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestLemma {

    val instance = PropositionalTableaux()
    val param = TableauxParam(TableauxType.UNCONNECTED, regular = false, backtracking = false)
    var states = mutableListOf<TableauxState>()

    val formula = mutableListOf(
        "a,a;!a,b;!b",
        "a;b,b;!a,!b",
        "!a,b;!b;a,b",
        "a,b;!b;!a,b"
    )

    @BeforeTest
    fun createStates() {
        for (i in formula.indices) {
            states.add(instance.parseFormulaToState(formula[i], param))
        }
    }

    @Test
    fun testValid1() {
        var state = states[0]
        // a,a;!a,b;!b
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        state = instance.applyMoveOnState(state, MoveExpand(4, 2))

        state = instance.applyMoveOnState(state, MoveAutoClose(3, 1))
        state = instance.applyMoveOnState(state, MoveAutoClose(5, 4))
        state = instance.applyMoveOnState(state, MoveLemma(2, 1))

        assertEquals(1, state.tree[6].lemmaSource)
        assertEquals(true, state.tree[6].negated)

        instance.applyMoveOnState(state, MoveAutoClose(6, 2))
    }

    @Test
    fun testValid2() {
        var state = states[1]
        // a;b,b;!a,!b
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        state = instance.applyMoveOnState(state, MoveExpand(2, 2))

        state = instance.applyMoveOnState(state, MoveAutoClose(4, 1))
        state = instance.applyMoveOnState(state, MoveAutoClose(5, 2))
        state = instance.applyMoveOnState(state, MoveLemma(3, 2))

        assertEquals(2, state.tree[6].lemmaSource)
        assertEquals(true, state.tree[6].negated)

        instance.applyMoveOnState(state, MoveAutoClose(6, 3))
    }

    @Test
    fun testValid3() {
        var state = states[2]

        // !a,b;!b;a,b
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        state = instance.applyMoveOnState(state, MoveExpand(3, 2))

        state = instance.applyMoveOnState(state, MoveAutoClose(4, 1))
        state = instance.applyMoveOnState(state, MoveAutoClose(5, 3))
        state = instance.applyMoveOnState(state, MoveLemma(2, 1))

        assertEquals(1, state.tree[6].lemmaSource)
        assertEquals(false, state.tree[6].negated)
    }

    @Test
    fun testInvalid() {
        var state = states[3]
        // a,b;!b;!a,b
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        state = instance.applyMoveOnState(state, MoveExpand(3, 2))

        state = instance.applyMoveOnState(state, MoveAutoClose(4, 1))
        state = instance.applyMoveOnState(state, MoveAutoClose(5, 3))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveLemma(2, 3))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveLemma(2, 4))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveLemma(5, 3))
        }

        assertEquals(6, state.tree.size)
    }

    @Test
    fun testSpecialCase() {
        var state = states[0]

        state = instance.applyMoveOnState(state, MoveExpand(0, 0))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveLemma(0, 0))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveLemma(1, Integer.MIN_VALUE))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveLemma(Integer.MAX_VALUE, 0))
        }
    }
}
