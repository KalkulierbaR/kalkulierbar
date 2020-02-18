package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestLemma {

    val instance = PropositionalTableaux()
    val param = TableauxParam(TableauxType.UNCONNECTED, false, false)
    var states = mutableListOf<TableauxState>()

    val formula = mutableListOf<String>(
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
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 1, 1))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 4, 2))

        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 3, 1))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 5, 4))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.LEMMA, 2, 1))

        assertEquals(true, state.nodes[6].isLemma)
        assertEquals(true, state.nodes[6].negated)

        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 6, 2))
    }

    @Test
    fun testValid2() {
        var state = states[1]
        // a;b,b;!a,!b
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 1, 1))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 2, 2))

        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 4, 1))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 5, 2))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.LEMMA, 3, 2))

        assertEquals(true, state.nodes[6].isLemma)
        assertEquals(true, state.nodes[6].negated)

        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 6, 3))
    }

    @Test
    fun testValid3() {
        var state = states[2]

        // !a,b;!b;a,b
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 1, 1))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 3, 2))

        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 4, 1))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 5, 3))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.LEMMA, 2, 1))

        assertEquals(true, state.nodes[6].isLemma)
        assertEquals(false, state.nodes[6].negated)
    }

    @Test
    fun testInvalid() {
        var state = states[3]
        // a,b;!b;!a,b
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 1, 1))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 3, 2))

        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 4, 1))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 5, 3))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove(MoveType.LEMMA, 2, 3))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove(MoveType.LEMMA, 2, 4))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove(MoveType.LEMMA, 5, 3))
        }

        assertEquals(6, state.nodes.size)
    }

    @Test
    fun testSpecialCase() {
        var state = states[0]

        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 0, 0))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove(MoveType.LEMMA, 0, 0))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove(MoveType.LEMMA, 1, Integer.MIN_VALUE))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove(MoveType.LEMMA, Integer.MAX_VALUE, 0))
        }
    }
}
