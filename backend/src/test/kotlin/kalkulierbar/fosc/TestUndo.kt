package kalkulierbar.fosc

import kalkulierbar.IllegalMove
import kalkulierbar.sequentCalculus.*
import kalkulierbar.sequentCalculus.fosc.FOSC
import kotlin.test.*

class TestUndo {
    val instance = FOSC()

    @Test
    fun testNothingToUndo() {
        val state = instance.parseFormulaToState("P(a) | P(b)", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, UndoMove())
        }
    }

    @Test
    fun testUndoOneChild() {
        var state = instance.parseFormulaToState("P(a) | P(b)", null)

        val prestateHash = state.getHash()

        state = instance.applyMoveOnState(state, OrRight(0, 0))
        state = instance.applyMoveOnState(state, UndoMove())

        assertEquals(prestateHash, state.getHash())
    }

    @Test
    fun testUndoTwoChild() {
        var state = instance.parseFormulaToState("P(a) & P(b)", null)

        val prestateHash = state.getHash()

        state = instance.applyMoveOnState(state, AndRight(0, 0))
        state = instance.applyMoveOnState(state, UndoMove())

        assertEquals(prestateHash, state.getHash())
    }

    @Test
    fun testUndoComplex() {
        var state = instance.parseFormulaToState("P(a) | !P(a)", null)

        val hash0 = state.getHash()

        state = instance.applyMoveOnState(state, OrRight(0, 0))
        val hash1 = state.getHash()

        state = instance.applyMoveOnState(state, NotRight(1, 1))
        val hash2 = state.getHash()

        println(hash2)
        state = instance.applyMoveOnState(state, Ax(state.tree.size - 1))

        state = instance.applyMoveOnState(state, UndoMove())
        assertEquals(hash2, state.getHash())

        state = instance.applyMoveOnState(state, UndoMove())
        assertEquals(hash1, state.getHash())

        state = instance.applyMoveOnState(state, UndoMove())
        assertEquals(hash0, state.getHash())
    }
}
