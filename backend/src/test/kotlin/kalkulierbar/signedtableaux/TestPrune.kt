package kalkulierbar.signedtableaux

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.ModalLogicParser
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestPrune {
    val instance = SignedModalTableaux()
    val parser = ModalLogicParser()

    @Test
    fun testBasicPrune() {
        var state = instance.parseFormulaToState("\\sign T: a & (b & c)", null)

        state = instance.applyMoveOnState(state, AlphaMove(0, null))
        state = instance.applyMoveOnState(state, AlphaMove(0, null))

        state = instance.applyMoveOnState(state, Prune(0))

        assertEquals(1, state.tree.size)
    }

    @Test
    fun testComplexPrune() {
        var state = instance.parseFormulaToState("\\sign T: a & (b | c)", null)

        state = instance.applyMoveOnState(state, AlphaMove(0, null))
        state = instance.applyMoveOnState(state, BetaMove(2, null))
        state = instance.applyMoveOnState(state, AlphaMove(0, 3))

        state = instance.applyMoveOnState(state, Prune(3))

        assertEquals(5, state.tree.size)
    }

    @Test
    fun testWrongPrune() {
        val state = instance.parseFormulaToState("!(a -> b)", SignedModalTableauxParam(false))
        assertFailsWith<IllegalMove> { instance.applyMoveOnState(state, Prune(0)) }
    }

    @Test
    fun testNoActionPrune() {
        val state = instance.parseFormulaToState("!(a -> b)", null)
        assertEquals(state, instance.applyMoveOnState(state, Prune(0)))
    }
}
