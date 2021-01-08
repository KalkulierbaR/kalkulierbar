package kalkulierbar.psc

import kalkulierbar.IllegalMove
import kalkulierbar.logic.Var
import kalkulierbar.parsers.PropositionalParser
import kalkulierbar.psc.PSC
import kalkulierbar.psc.PSCMove
import kalkulierbar.psc.PSCState
import kotlin.test.*

class TestOrRight {
    val instance = PSC()
    val parser = PropositionalParser()

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("a | b", null)

        state = instance.applyMoveOnState(state, OrRight(0,0))

        val formula1 = parser.parse("a ")
        val formula2 = parser.parse("b ")
        val node1 = state.tree[state.tree.size - 1]



        assertTrue(node1.rightFormula[0].synEq(formula1))
        assertTrue(node1.rightFormula[1].synEq(formula2))

        assertTrue(node1.rightFormula[0] is Var)
        assertTrue(node1.rightFormula[1] is Var)

    }
    @Test
    fun testParent(){
        var state = instance.parseFormulaToState("a | b", null)
        assertTrue(state.tree[0].parent == null)

        state = instance.applyMoveOnState(state, OrRight(0,0))

        assertTrue(state.tree[0] is OneChildNode)
        assertEquals(state.tree[1].parent, 0)
    }

    @Test
    fun testWrongNode() {
        var state = instance.parseFormulaToState("a & b", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, OrRight(0,0))
        }
    }
}