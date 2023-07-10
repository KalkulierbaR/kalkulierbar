package kalkulierbar.firstordersequent

import kalkulierbar.IllegalMove
import kalkulierbar.logic.Relation
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.sequent.AndLeft
import kalkulierbar.sequent.fo.FirstOrderSequent
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class TestAndLeft {
    val instance = FirstOrderSequent()
    val parser = FirstOrderParser()

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("(P(a) & P(b)) |-", null)

        state = instance.applyMoveOnState(state, AndLeft(0, 0))

        val formula1 = parser.parse("P(a)")
        val formula2 = parser.parse("P(b)")
        val node1 = state.tree[state.tree.size - 1]

        assertTrue(node1.leftFormulas[0].synEq(formula1))
        assertTrue(node1.leftFormulas[1].synEq(formula2))

        assertTrue(node1.leftFormulas[0] is Relation)
        assertTrue(node1.leftFormulas[1] is Relation)
    }

    @Test
    fun testParent() {
        var state = instance.parseFormulaToState("(P(a) & P(b)) |-", null)
        state = instance.applyMoveOnState(state, AndLeft(0, 0))

        assertTrue(state.tree[0].children.size == 1)
        assertEquals(state.tree[1].parent, 0)
    }

    @Test
    fun testWrongNode() {
        val state = instance.parseFormulaToState("(P(a) & P(b))", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, AndLeft(0, 0))
        }
    }
}
