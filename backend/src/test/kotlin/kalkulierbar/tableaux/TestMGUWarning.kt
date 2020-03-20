package kalkulierbar.tableaux

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals

class TestMGUWarning {

    val instance = FirstOrderTableaux()

    @Test
    fun testNonMGU() {
        var state = instance.parseFormulaToState("/all X: R(X) & /all Y: !R(Y)", null)
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))

        val move = FoTableauxMove(FoMoveType.CLOSE, 2, 1, mapOf("X_1" to "c", "Y_2" to "c"))
        state = instance.applyMoveOnState(state, move)

        assertNotEquals(null, state.statusMessage)
    }

    @Test
    fun testValidMGU() {
        var state = instance.parseFormulaToState("/all X: R(X) & !R(c)", null)
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))

        val move1 = FoTableauxMove(FoMoveType.CLOSE, 2, 1, mapOf("X_1" to "c"))
        state = instance.applyMoveOnState(state, move1)

        assertEquals(null, state.statusMessage)

        state = instance.parseFormulaToState("/all X: R(X) & /all Y: !R(Y)", null)
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))

        val move2 = FoTableauxMove(FoMoveType.CLOSE, 2, 1, mapOf("Y_2" to "X_1"))
        state = instance.applyMoveOnState(state, move2)

        assertEquals(null, state.statusMessage)
    }

    @Test
    fun testAmbiguousMGU() {
        // Test one valid MGU
        var state = instance.parseFormulaToState("/all X: R(X) & /all Y: !R(Y)", null)
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))

        val move1 = FoTableauxMove(FoMoveType.CLOSE, 2, 1, mapOf("X_1" to "X_1", "Y_2" to "X_1"))
        state = instance.applyMoveOnState(state, move1)

        assertEquals(null, state.statusMessage)

        println("Second case")

        // Test other valid MGU
        state = instance.parseFormulaToState("/all X: R(X) & /all Y: !R(Y)", null)
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))

        val move2 = FoTableauxMove(FoMoveType.CLOSE, 2, 1, mapOf("X_1" to "Y_2", "Y_2" to "Y_2"))
        state = instance.applyMoveOnState(state, move2)

        assertEquals(null, state.statusMessage)
    }

    @Test
    fun testExtraVariables() {
        var state = instance.parseFormulaToState("/all X: /all Z: (R(X)|Q(Z)) & /all Y: !R(Y)", null)
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 1))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 0))

        val move = FoTableauxMove(FoMoveType.CLOSE, 2, 1, mapOf("X_2" to "X_2", "Y_1" to "X_2", "Z_2" to "X_2"))
        state = instance.applyMoveOnState(state, move)
        assertNotEquals(null, state.statusMessage)
    }

    @Test
    fun testMessageReset() {
        var state = instance.parseFormulaToState("/all X: (R(X)|Q(c)) & /all Y: !R(Y)", null)
        assertEquals(null, state.statusMessage)
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 1))
        assertEquals(null, state.statusMessage)
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 0))
        assertEquals(null, state.statusMessage)

        val move = FoTableauxMove(FoMoveType.CLOSE, 2, 1, mapOf("X_2" to "c", "Y_1" to "c"))
        state = instance.applyMoveOnState(state, move)
        assertNotEquals(null, state.statusMessage)

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 3, 1))
        assertEquals(null, state.statusMessage)
    }
}
