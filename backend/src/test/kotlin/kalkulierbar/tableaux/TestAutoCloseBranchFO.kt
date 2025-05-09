package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestAutoCloseBranchFO {
    val instance = FirstOrderTableaux()
    private val param =
        FoTableauxParam(
            TableauxType.UNCONNECTED,
            regular = false,
            backtracking = false,
            manualVarAssign = false,
        )
    private var states = mutableListOf<FoTableauxState>()

    val formula =
        mutableListOf(
            "\\all A: (\\all B: (R(A) -> R(B) & !R(A) | !R(B)))",
            "(R(a) <-> !R(b)) | (!R(a) -> R(b))",
            "\\ex A : (R(A) & (\\all B: !R(B) & !R(A)))",
            "\\ex Usk: (R(Usk) -> (!\\ex Usk: (R(sk1) & !R(Usk) | R(Usk) & !R(sk1))))",
            "\\all A: (Sk1(A) -> !\\ex B: (R(A) & !R(B) -> Sk1(B) | !Sk1(A)))",
            "\\all X: (R(g(X)) & !R(f(X)))",
        )

    @BeforeTest
    fun createStates() {
        for (i in formula.indices) {
            states.add(instance.parseFormulaToState(formula[i], param))
        }
    }

    @Test
    fun state1() {
        var state = states[0]
        // {!R(a), R(b), !R(b)}, {!R(a), !R(a), !R(b)}
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(2, 1))
        state = instance.applyMoveOnState(state, MoveAutoClose(6, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(4, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(5, 2))

        val nodes = state.tree
        // check for leaf closed and close ref
        assertEquals(nodes[6].isClosed, true)
        assertEquals(nodes[6].closeRef, 2)

        // check illegal close
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(4, 1))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(4, 3))
        }
    }

    @Test
    fun state2() {
        var state = states[1]
        // {R(a), !R(a), R(a), R(b)}, {R(a), R(b), R(a), R(b)}, {!R(b), !R(a), R(a), R(b)}, {!R(b), R(b), R(a), R(b)}
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(3, 2))
        state = instance.applyMoveOnState(state, MoveExpand(4, 3))
        state = instance.applyMoveOnState(state, MoveAutoClose(6, 3))
        state = instance.applyMoveOnState(state, MoveAutoClose(9, 4))

        val nodes = state.tree
        // check for leaf closed and close ref
        assertEquals(nodes[6].isClosed, true)
        assertEquals(nodes[6].closeRef, 3)

        assertEquals(nodes[9].isClosed, true)
        assertEquals(nodes[9].closeRef, 4)

        // check illegal close
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(5, 1))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(6, 3))
        }
    }

    @Test
    fun state3() {
        var state = states[2]
        // {R(sk-1)}, {!R(B)}, {!R(sk-1)}
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        state = instance.applyMoveOnState(state, MoveExpand(2, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(3, 1))

        val nodes = state.tree
        // check for leaf closed and close ref
        assertEquals(nodes[3].isClosed, true)
        assertEquals(nodes[3].closeRef, 1)
        assertEquals(nodes[1].isClosed, true)

        // check illegal close
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(3, 1))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(2, 1))
        }
    }

    @Test
    fun invalid() {
        var state = states[0]
        // {!R(a), R(b), !R(b)}, {!R(a), !R(a), !R(b)}
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(2, 1))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(6, -1))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(6, 42))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(6, 0))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(-1, 1))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(777, 2))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(6, -1))
        }
        assertFailsWith<IllegalMove> {
            state = instance.applyMoveOnState(state, MoveAutoClose(Int.MAX_VALUE, 5))
        }
        assertFailsWith<IllegalMove> {
            state = instance.applyMoveOnState(state, MoveAutoClose(6, Int.MIN_VALUE))
        }
    }

    @Test
    fun testImpossibleUnification() {
        var state = states[5]
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(2, 1))
        }
    }

    // Prints ClauseSet of each state
    @Test
    fun printStateClauseSet() {
        for (state in states) {
            println(state.clauseSet.toString())
        }
    }
}
