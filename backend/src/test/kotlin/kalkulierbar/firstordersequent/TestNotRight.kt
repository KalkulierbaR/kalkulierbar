package kalkulierbar.firstordersequent

import kalkulierbar.IllegalMove
import kalkulierbar.logic.Relation
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.sequent.NotRight
import kalkulierbar.sequent.fo.FirstOrderSequent
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class TestNotRight {
    val instance = FirstOrderSequent()
    val parser = FirstOrderParser()

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("!P(a)", null)

        state = instance.applyMoveOnState(state, NotRight(0, 0))
        val formula1 = parser.parse("P(a)")
        val node1 = state.tree[state.tree.size - 1]

        assertTrue(node1.leftFormulas[0].synEq(formula1))

        assertTrue(node1.leftFormulas[0] is Relation)
    }

    @Test
    fun testParent() {
        var state = instance.parseFormulaToState("!P(a) ", null)
        assertTrue(state.tree[0].parent == null)

        state = instance.applyMoveOnState(state, NotRight(0, 0))

        assertTrue(state.tree[0].children.size == 1)
        assertEquals(state.tree[1].parent, 0)
    }

    @Test
    fun testWrongNode() {
        val state = instance.parseFormulaToState("P(a) & !P(a)", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, NotRight(0, 0))
        }
    }
}
