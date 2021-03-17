package kalkulierbar.test.signedtableaux

import kalkulierbar.IllegalMove
import kalkulierbar.logic.*
import kalkulierbar.parsers.ModalLogicParser
import kalkulierbar.signedtableaux.NuMove
import kalkulierbar.signedtableaux.PiMove
import kalkulierbar.signedtableaux.SignedModalTableaux
import kalkulierbar.signedtableaux.AlphaMove
import kalkulierbar.signedtableaux.BetaMove
import kalkulierbar.signedtableaux.Prune
import kotlin.test.*

class TestPruneMove {

    val instance = SignedModalTableaux()
    val parser = ModalLogicParser()

    @Test
    fun testBasicPrune() {
        var state = instance.parseFormulaToState("\\sign T: a & (b & c)", null)

        state = instance.applyMoveOnState(state, AlphaMove(0, null))
        state = instance.applyMoveOnState(state, AlphaMove(0, null))

        state = instance.applyMoveOnState(state, Prune(0))

        assertEquals(1, state.nodes.size)
    }

    @Test
    fun testComplexPrune() {
        var state = instance.parseFormulaToState("\\sign T: a & (b | c)", null)

        state = instance.applyMoveOnState(state, AlphaMove(0, null))
        state = instance.applyMoveOnState(state, BetaMove(2, null))
        state = instance.applyMoveOnState(state, AlphaMove(0, 3))

        state = instance.applyMoveOnState(state, Prune(3))

        assertEquals(5, state.nodes.size)
    }
}