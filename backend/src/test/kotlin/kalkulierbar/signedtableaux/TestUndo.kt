package kalkulierbar.test.signedtableaux

import kalkulierbar.IllegalMove
import kalkulierbar.logic.*
import kalkulierbar.parsers.ModalLogicParser
import kalkulierbar.signedtableaux.SignedModalTableaux
import kalkulierbar.signedtableaux.AlphaMove
import kalkulierbar.signedtableaux.BetaMove
import kalkulierbar.signedtableaux.NuMove
import kalkulierbar.signedtableaux.PiMove
import kalkulierbar.signedtableaux.Negation
import kalkulierbar.signedtableaux.UndoMove
import kotlin.test.*

class TestUndo {
    val instance = SignedModalTableaux()
    val parser = ModalLogicParser()

    @Test
    fun testUndoComplex() {
        var state = instance.parseFormulaToState("!(<>(!a)) -> []a", null)

        val hash0 = state.getHash()

        state = instance.applyMoveOnState(state, AlphaMove(0, null))
        val hash1 = state.getHash()

        state = instance.applyMoveOnState(state, Negation(1, null))
        val hash2 = state.getHash()

        state = instance.applyMoveOnState(state, PiMove(1, 2, null))
        val hash3 = state.getHash()

        state = instance.applyMoveOnState(state, NuMove(1, 3, null))
        val hash4 = state.getHash()

        state = instance.applyMoveOnState(state, Negation(5, null))

        state = instance.applyMoveOnState(state, UndoMove())
        assertEquals(hash4, state.getHash())

        state = instance.applyMoveOnState(state, UndoMove())
        assertEquals(hash3, state.getHash())

        state = instance.applyMoveOnState(state, UndoMove())
        assertEquals(hash2, state.getHash())

        state = instance.applyMoveOnState(state, UndoMove())
        assertEquals(hash1, state.getHash())

        state = instance.applyMoveOnState(state, UndoMove())
        assertEquals(hash0, state.getHash())
    }

    @Test
    fun testUndoTwoChild() {
        var state = instance.parseFormulaToState("a & b", null)

        val prestateHash = state.getHash()

        state = instance.applyMoveOnState(state, BetaMove(0, null))
        state = instance.applyMoveOnState(state, UndoMove())

        assertEquals(prestateHash, state.getHash())
    }

    @Test
    fun testWrongUndo() {
        var state = instance.parseFormulaToState("!(a -> b)", null)
        assertFailsWith<IllegalMove> { instance.applyMoveOnState(state, UndoMove()) }
    }
}