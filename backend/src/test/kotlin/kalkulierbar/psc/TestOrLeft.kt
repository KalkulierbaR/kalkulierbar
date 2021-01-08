package kalkulierbar.psc

import kalkulierbar.parsers.PropositionalParser
import kalkulierbar.IllegalMove
import kalkulierbar.psc.PSC
import kalkulierbar.psc.PSCMove
import kalkulierbar.psc.PSCState
import kotlin.test.*

class TestOrLeft {

    val instance = PSC()
    val parser = PropositionalParser()

    @Test
    fun testSimple() {
        var state = instance.parseFormulaToState("!((a & b) | (b |c))", null)

        state = instance.applyMoveOnState(state, NotRight(0,0))
        state = instance.applyMoveOnState(state, OrLeft(1,0))

        val formula1 = parser.parse("a & b")
        val formula2 = parser.parse("b | c")

        val node1 = state.tree[state.tree.size - 2]
        val node2 = state.tree[state.tree.size - 1]


        assertTrue(node1.leftFormula[0].synEq(formula1))
        assertTrue(node2.leftFormula[0].synEq(formula2))
    }


}