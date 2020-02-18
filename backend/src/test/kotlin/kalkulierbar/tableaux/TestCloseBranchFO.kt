package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestCloseBranchFO {

    val instance = FirstOrderTableaux()
    val param = FoTableauxParam(TableauxType.UNCONNECTED, true, false, true)
    val paramNotReg = FoTableauxParam(TableauxType.UNCONNECTED, false, false, true)
    var states = mutableListOf<FoTableauxState>()
    var notRegStates = mutableListOf<FoTableauxState>()

    val formula = listOf<String>(
            "\\all X: R(X) & R(c) & !R(c)",
            "\\all X: \\ex Y: R(X,Y) & \\ex Z: \\all W: !R(Z, W)", // R(X, sk1(X)), !R(sk2, W)
            "\\all A: (\\all B: (R(A) -> R(B) & !R(A) | !R(B)))",
            "\\all A: (R(A) -> !\\ex B: (R(A) & !R(B) -> R(B) | R(A)))"
    )

    @BeforeTest
    fun createStates() {
        for (f in formula) {
            states.add(instance.parseFormulaToState(f, param))
            notRegStates.add(instance.parseFormulaToState(f, paramNotReg))
        }
    }

    @Test
    fun testRegularityViolation() {
        var state = states[0]
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 2))

        assertFailsWith<IllegalMove> {
            val move = FoTableauxMove(FoMoveType.CLOSE, 3, 1, mapOf("X_1" to "c"))
            instance.applyMoveOnState(state, move)
        }
    }

    @Test
    fun testManualVarAssignOnly() {
        var state = states[0]
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 1))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 2))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 2, 1))
        }
    }

    @Test
    fun testIncorrectInstantiation() {
        var state = states[1]

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))

        val incorrect = mapOf("X_1" to "sk2", "W_2" to "sk1(c)") // Should be sk1(sk2)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 2, 1, incorrect))
        }
    }

    @Test
    fun testValid1() {
        var state = states[1]

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))

        val correct = mapOf("X_1" to "sk2", "W_2" to "sk1(sk2)")

        instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 2, 1, correct))
        val msg = instance.checkCloseOnState(state)

        assert(msg.closed)
    }

    @Test
    fun testValid2() {
        var state = notRegStates[2]
        // {!R(A), R(B), !R(B)}, {!R(A), !R(A), !R(B)}
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 1))

        val map = mapOf("B_2" to "B_1", "A_2" to "B_1")

        // Without mapping
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 4, 2))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 5, 2))
        }

        // With mapping
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 6, 2, map))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 4, 2, map))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 5, 2, map))

        assertEquals(state.nodes[2].isClosed, true)
        assertEquals(state.nodes[4].isClosed, true)
        assertEquals(state.nodes[4].closeRef, 2)
        assertEquals(state.nodes[5].isClosed, true)
        assertEquals(state.nodes[5].closeRef, 2)
        assertEquals(state.nodes[6].isClosed, true)
        assertEquals(state.nodes[6].closeRef, 2)
    }
/*
    @Test
    fun testValid3() {
        var state = states[3]
    }*/

    @Test
    // Prints ClauseSet of each state
    fun printStateClauseSet() {
        for (state in states) {
            println(state.clauseSet.toString())
        }
    }
}
