package kalkulierbar.firstordersequent

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.sequent.NotRight
import kalkulierbar.sequent.OrLeft
import kalkulierbar.sequent.fo.FirstOrderSequent
import kotlin.test.Test
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class TestOrLeft {

    val instance = FirstOrderSequent()
    val parser = FirstOrderParser()

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("!((P(a) & P(b)) | (P(b) |P(c)))", null)

        state = instance.applyMoveOnState(state, NotRight(0, 0))
        state = instance.applyMoveOnState(state, OrLeft(1, 0))

        val formula1 = parser.parse("P(a) & P(b)")
        val formula2 = parser.parse("P(b) | P(c)")

        val node1 = state.tree[state.tree.size - 2]
        val node2 = state.tree[state.tree.size - 1]

        assertTrue(node1.leftFormulas[0].synEq(formula1))
        assertTrue(node2.leftFormulas[0].synEq(formula2))
    }

    @Test
    fun testParent() {
        var state = instance.parseFormulaToState("!((P(a) & P(b)) | (P(b) |P(c)))", null)

        state = instance.applyMoveOnState(state, NotRight(0, 0))
        state = instance.applyMoveOnState(state, OrLeft(1, 0))

        val node1 = state.tree[state.tree.size - 2]

        assertTrue(state.tree[node1.parent!!].children.size == 2)
    }

    @Test
    fun testWrongNode() {
        var state = instance.parseFormulaToState("!((P(a) & P(b)) & (P(b) |P(c)))", null)

        state = instance.applyMoveOnState(state, NotRight(0, 0))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, OrLeft(1, 0))
        }
    }
}
