package kalkulierbar.psc

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.PropositionalParser
import kalkulierbar.psc.PSC
import kalkulierbar.psc.PSCMove
import kalkulierbar.psc.PSCState
import kotlin.test.assertEquals
import kotlin.test.*

class TestAx {

    val instance = PSC()
    val parser = PropositionalParser()

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("a | !a", null)

        state = instance.applyMoveOnState(state, OrRight(0,0))
        state = instance.applyMoveOnState(state, NotRight(1,1))

        state = instance.applyMoveOnState(state, Ax(2))

        val node = state.tree[state.tree.size -1]

        assertTrue(node.leftFormula.size == 0)
        assertTrue(node.rightFormula.size == 0)
    }

    fun testParent() {
        var state = instance.parseFormulaToState("a | !a", null)

        state = instance.applyMoveOnState(state, OrRight(0,0))
        state = instance.applyMoveOnState(state, NotRight(1,1))

        state = instance.applyMoveOnState(state, Ax(2))

        val node = state.tree[state.tree.size -1]

        assertNotNull(node.parent)
        assert(state.tree[node.parent!!] is OneChildNode)
    }

    fun testFail(){
        var state = instance.parseFormulaToState("a | !a", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, Ax(0))
        }
    }
}