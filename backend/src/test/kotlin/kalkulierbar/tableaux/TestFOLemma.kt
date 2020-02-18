package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestFOLemma {

    val instance = FirstOrderTableaux()
    val automaticParam = FoTableauxParam(TableauxType.UNCONNECTED, false, false, false)
    val manualParam = FoTableauxParam(TableauxType.UNCONNECTED, false, false, true)

    var autoStates = mutableListOf<FoTableauxState>()
    var manualStates = mutableListOf<FoTableauxState>()

    val formula = listOf<String>(
            "\\all A: (\\all B: (R(A) -> R(B) & !R(A) | !R(B)))",
            "\\all A: (R(A) -> !\\ex B: (R(A) & !R(B) -> R(B) & R(A)))"
    )

    @BeforeTest
    fun createStates() {
        for (i in formula.indices) {
            autoStates.add(instance.parseFormulaToState(formula[i], automaticParam))
        }
        for (i in formula.indices) {
            manualStates.add(instance.parseFormulaToState(formula[i], manualParam))
        }
    }

    @Test
    fun testValid1() {
        var state = manualStates[0]
        // {!R(A), R(B), !R(B)}, {!R(A), !R(A), !R(B)}
        val map = mapOf("B_1" to "c", "A_2" to "c", "B_2" to "c")
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 1))

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 4, 2, map))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 5, 2, map))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 6, 2, map))

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.LEMMA, 1, 2))
        assertEquals(true, state.nodes[7].isLemma)
        assertEquals(true, state.nodes[7].negated)
    }

    @Test
    fun testValid2() {
        var state = autoStates[0]
        // {!R(A), R(B), !R(B)}, {!R(A), !R(A), !R(B)}
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 1))

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 4, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 5, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 6, 2))

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.LEMMA, 1, 2))
        assertEquals(true, state.nodes[7].isLemma)
        assertEquals(true, state.nodes[7].negated)
    }

    @Test
    fun testValid3() {
        var state = autoStates[1]
        // {!R(A), R(A)}, {!R(A), !R(B)}, {!R(A), !R(B), !R(A)}
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 2))

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 3, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 4, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 5, 2))

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.LEMMA, 1, 2))
        assertEquals(true, state.nodes[6].isLemma)
        assertEquals(true, state.nodes[6].negated)

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 6, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 8, 6))
    }

    @Test
    fun testValid4() {
        var state = autoStates[1]
        // {!R(A), R(A)}, {!R(A), !R(B)}, {!R(A), !R(B), !R(A)}
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 3, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 4, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 5, 2))

        instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.LEMMA, 6, 2))
    }

    @Test
    fun testInvalid() {
        var state = autoStates[1]
        // {!R(A), R(A)}, {!R(A), !R(B)}, {!R(A), !R(B), !R(A)}
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 3, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 4, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 5, 2))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.LEMMA, -1, 2))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.LEMMA, 0, 2))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.LEMMA, 5, 3))
        }
        assertEquals(8, state.nodes.size)
    }

    @Test
    fun testSpecialCase() {
        var state = autoStates[0]

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.LEMMA, 0, 0))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.LEMMA, 1, Integer.MIN_VALUE))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.LEMMA, Integer.MAX_VALUE, 0))
        }
    }
}
