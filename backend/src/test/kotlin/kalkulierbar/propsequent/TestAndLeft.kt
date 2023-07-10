package kalkulierbar.propsequent

import kalkulierbar.IllegalMove
import kalkulierbar.logic.Var
import kalkulierbar.parsers.PropositionalParser
import kalkulierbar.sequent.AndLeft
import kalkulierbar.sequent.NotRight
import kalkulierbar.sequent.prop.PropositionalSequent
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class TestAndLeft {
    val instance = PropositionalSequent()
    val parser = PropositionalParser()

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("!(a & b)", null)

        state = instance.applyMoveOnState(state, NotRight(0, 0))
        state = instance.applyMoveOnState(state, AndLeft(1, 0))

        val formula1 = parser.parse("a ")
        val formula2 = parser.parse("b ")
        val node1 = state.tree[state.tree.size - 1]

        assertTrue(node1.leftFormulas[0].synEq(formula1))
        assertTrue(node1.leftFormulas[1].synEq(formula2))

        assertTrue(node1.leftFormulas[0] is Var)
        assertTrue(node1.leftFormulas[1] is Var)
    }

    @Test
    fun testParent() {
        var state = instance.parseFormulaToState("!(a & b)", null)
        state = instance.applyMoveOnState(state, NotRight(0, 0))
        assertTrue(state.tree[0].parent == null)

        state = instance.applyMoveOnState(state, AndLeft(1, 0))

        assertTrue(state.tree[0].children.size == 1)
        assertEquals(state.tree[1].parent, 0)
    }

    @Test
    fun testWrongNode() {
        val state = instance.parseFormulaToState("a & b", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, AndLeft(0, 0))
        }
    }
}
