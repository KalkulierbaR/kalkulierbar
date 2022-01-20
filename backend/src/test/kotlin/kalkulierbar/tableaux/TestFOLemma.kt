package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestFOLemma {

    val instance = FirstOrderTableaux()
    private val automaticParam = FoTableauxParam(
        TableauxType.UNCONNECTED,
        regular = false,
        backtracking = false,
        manualVarAssign = false
    )
    private val manualParam = FoTableauxParam(
        TableauxType.UNCONNECTED,
        regular = false,
        backtracking = false,
        manualVarAssign = true
    )

    private var autoStates = mutableListOf<FoTableauxState>()
    private var manualStates = mutableListOf<FoTableauxState>()

    val formula = listOf(
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
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(2, 1))

        state = instance.applyMoveOnState(state, MoveCloseAssign(4, 2, map))
        state = instance.applyMoveOnState(state, MoveCloseAssign(5, 2, map))
        state = instance.applyMoveOnState(state, MoveCloseAssign(6, 2, map))

        state = instance.applyMoveOnState(state, MoveLemma(1, 2))
        assertEquals(2, state.tree[7].lemmaSource)
        assertEquals(true, state.tree[7].negated)
    }

    @Test
    fun testValid2() {
        var state = autoStates[0]
        // {!R(A), R(B), !R(B)}, {!R(A), !R(A), !R(B)}
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(2, 1))

        state = instance.applyMoveOnState(state, MoveAutoClose(4, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(5, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(6, 2))

        state = instance.applyMoveOnState(state, MoveLemma(1, 2))
        assertEquals(2, state.tree[7].lemmaSource)
        assertEquals(true, state.tree[7].negated)
    }

    @Test
    fun testValid3() {
        var state = autoStates[1]
        // {!R(A), R(A)}, {!R(A), !R(B)}, {!R(A), !R(B), !R(A)}
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(2, 2))

        state = instance.applyMoveOnState(state, MoveAutoClose(3, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(4, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(5, 2))

        state = instance.applyMoveOnState(state, MoveLemma(1, 2))
        assertEquals(2, state.tree[6].lemmaSource)
        assertEquals(true, state.tree[6].negated)

        state = instance.applyMoveOnState(state, MoveExpand(6, 0))
        instance.applyMoveOnState(state, MoveAutoClose(8, 6))
    }

    @Test
    fun testValid4() {
        var state = autoStates[1]
        // {!R(A), R(A)}, {!R(A), !R(B)}, {!R(A), !R(B), !R(A)}
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(2, 2))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))

        state = instance.applyMoveOnState(state, MoveAutoClose(3, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(4, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(5, 2))

        instance.applyMoveOnState(state, MoveLemma(6, 2))
    }

    @Test
    fun testInvalid() {
        var state = autoStates[1]
        // {!R(A), R(A)}, {!R(A), !R(B)}, {!R(A), !R(B), !R(A)}
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(2, 2))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))

        state = instance.applyMoveOnState(state, MoveAutoClose(3, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(4, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(5, 2))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveLemma(-1, 2))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveLemma(0, 2))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveLemma(5, 3))
        }
        assertEquals(8, state.tree.size)
    }

    @Test
    fun testSpecialCase() {
        var state = autoStates[0]

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
