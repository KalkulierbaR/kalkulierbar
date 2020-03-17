package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestAutoCloseBranchFO {

    val instance = FirstOrderTableaux()
    val param = FoTableauxParam(TableauxType.UNCONNECTED, false, false, false)
    var states = mutableListOf<FoTableauxState>()

    val formula = mutableListOf<String>(
            "\\all A: (\\all B: (R(A) -> R(B) & !R(A) | !R(B)))",
            "(R(a) <-> !R(b)) | (!R(a) -> R(b))",
            "\\ex A : (R(A) & (\\all B: !R(B) & !R(A)))",
            "\\ex Usk: (R(Usk) -> (!\\ex Usk: (R(sk1) & !R(Usk) | R(Usk) & !R(sk1))))",
            "\\all A: (Sk1(A) -> !\\ex B: (R(A) & !R(B) -> Sk1(B) | !Sk1(A)))",
            "\\all X: (R(g(X)) & !R(f(X)))"
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
        state = instance.applyMoveOnState(state, MoveClose(6, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 4, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 5, 2))

        val nodes = state.nodes
        // check for leaf closed and close ref
        assertEquals(nodes[6].isClosed, true)
        assertEquals(nodes[6].closeRef, 2)

        // check illegal close
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 4, 1))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 4, 3))
        }
    }

    @Test
    fun state2() {
        var state = states[1]
        // {R(a), !R(a), R(a), R(b)}, {R(a), R(b), R(a), R(b)}, {!R(b), !R(a), R(a), R(b)}, {!R(b), R(b), R(a), R(b)}
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 3, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 4, 3))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 6, 3))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 9, 4))

        val nodes = state.nodes
        // check for leaf closed and close ref
        assertEquals(nodes[6].isClosed, true)
        assertEquals(nodes[6].closeRef, 3)

        assertEquals(nodes[9].isClosed, true)
        assertEquals(nodes[9].closeRef, 4)

        // check illegal close
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 5, 1))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 6, 3))
        }
    }

    @Test
    fun state3() {
        var state = states[2]
        // {R(sk-1)}, {!R(B)}, {!R(sk-1)}
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 3, 1))

        val nodes = state.nodes
        // check for leaf closed and close ref
        assertEquals(nodes[3].isClosed, true)
        assertEquals(nodes[3].closeRef, 1)
        assertEquals(nodes[1].isClosed, true)

        // check illegal close
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 3, 1))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 2, 1))
        }
    }

    @Test
    fun invalid() {
        var state = states[0]
        // {!R(a), R(b), !R(b)}, {!R(a), !R(a), !R(b)}
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 1))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 6, -1))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 6, 42))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 6, 0))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, -1, 1))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 777, 2))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 6, -1))
        }
        assertFailsWith<IllegalMove> {
            state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, Int.MAX_VALUE, 5))
        }
        assertFailsWith<IllegalMove> {
            state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 6, Int.MIN_VALUE))
        }
    }

    @Test
    fun testImpossibleUnification() {
        var state = states[5]
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 2, 1))
        }
    }

    @Test
    // Prints ClauseSet of each state
    fun printStateClauseSet() {
        for (state in states) {
            println(state.clauseSet.toString())
        }
    }
}
