package kalkulierbar.psc

import kalkulierbar.psc.PSC
import kalkulierbar.psc.PSCMove
import kalkulierbar.psc.PSCState
import kotlin.test.assertEquals
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith


class TestUndo {
    val instance = PSC()

    @Test
    fun testUndoExpandSimple() {
        var state = instance.parseFormulaToState("a | b", null)

        val prestateHash = state.getHash()

        state = instance.applyMoveOnState(state, OrRight(0, 0))
        state = instance.applyMoveOnState(state, UndoMove())

        assertEquals(prestateHash, state.getHash())
    }
}