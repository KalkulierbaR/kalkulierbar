package kalkulierbar.test.signedtableaux

import kalkulierbar.parsers.ModalLogicParser
import kalkulierbar.signedtableaux.AlphaMove
import kalkulierbar.signedtableaux.CloseMove
import kalkulierbar.signedtableaux.Negation
import kalkulierbar.signedtableaux.NuMove
import kalkulierbar.signedtableaux.PiMove
import kalkulierbar.signedtableaux.SignedModalTableaux
import kotlin.test.*

class TestClose {
    val instance = SignedModalTableaux()
    val parser = ModalLogicParser()

    @Test
    fun testCloseComplex() {
        var state = instance.parseFormulaToState("!(<>(!a)) -> []a", null)

        state = instance.applyMoveOnState(state, AlphaMove(0, null))

        state = instance.applyMoveOnState(state, Negation(1, null))

        state = instance.applyMoveOnState(state, PiMove(1, 2, null))

        state = instance.applyMoveOnState(state, NuMove(1, 3, null))

        state = instance.applyMoveOnState(state, Negation(5, null))

        val stateTopDown = instance.applyMoveOnState(state, CloseMove(4, 6))
        // val stateDownTop = instance.applyMoveOnState(state, CloseMove(6, 4))

        stateTopDown.tree.forEach { node -> assertEquals(true, node.isClosed) }
        // stateDownTop.nodes.forEach { node -> assertEquals(true, node.isClosed) }
    }
}
