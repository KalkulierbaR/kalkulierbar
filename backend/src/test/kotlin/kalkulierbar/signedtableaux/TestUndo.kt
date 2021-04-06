package kalkulierbar.test.signedtableaux

import kalkulierbar.IllegalMove
import kalkulierbar.logic.*
import kalkulierbar.parsers.ModalLogicParser
import kalkulierbar.signedtableaux.AlphaMove
import kalkulierbar.signedtableaux.BetaMove
import kalkulierbar.signedtableaux.Negation
import kalkulierbar.signedtableaux.NuMove
import kalkulierbar.signedtableaux.PiMove
import kalkulierbar.signedtableaux.SignedModalTableaux
import kalkulierbar.signedtableaux.SignedModalTableauxParam
import kalkulierbar.signedtableaux.UndoMove
import kotlin.test.*

class TestUndo {
    val instance = SignedModalTableaux()
    val parser = ModalLogicParser()

    @Test
    fun testUndoComplex() {
        var state = instance.parseFormulaToState("!(<>(!a)) -> []a", null)
        var state2 = instance.parseFormulaToState("!(<>(!a)) -> []a", null)

        state2.usedBacktracking = true
        val hash0 = state2.getHash()

        state = instance.applyMoveOnState(state, AlphaMove(0, null))
        state2 = instance.applyMoveOnState(state2, AlphaMove(0, null))
        state2.usedBacktracking = true
        val hash1 = state2.getHash()

        state = instance.applyMoveOnState(state, Negation(1, null))
        state2 = instance.applyMoveOnState(state2, Negation(1, null))
        state2.usedBacktracking = true
        val hash2 = state2.getHash()

        state = instance.applyMoveOnState(state, PiMove(1, 2, null))
        state2 = instance.applyMoveOnState(state2, PiMove(1, 2, null))
        state2.usedBacktracking = true
        val hash3 = state2.getHash()

        state = instance.applyMoveOnState(state, NuMove(1, 3, null))
        state2 = instance.applyMoveOnState(state2, NuMove(1, 3, null))
        state2.usedBacktracking = true
        val hash4 = state2.getHash()

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
        var state2 = instance.parseFormulaToState("a & b", null)

        state2.usedBacktracking = true
        val prestateHash = state2.getHash()

        state = instance.applyMoveOnState(state, BetaMove(0, null))
        state = instance.applyMoveOnState(state, UndoMove())

        assertEquals(prestateHash, state.getHash())
    }

    @Test
    fun testWrongUndo() {
        var state = instance.parseFormulaToState("!(a -> b)", SignedModalTableauxParam(false))
        assertFailsWith<IllegalMove> { instance.applyMoveOnState(state, UndoMove()) }
    }
}
