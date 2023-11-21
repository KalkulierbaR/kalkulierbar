package kalkulierbar.propsequent

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.PropositionalParser
import kalkulierbar.sequent.AndRight
import kalkulierbar.sequent.prop.PropositionalSequent
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class TestAndRight {

    val instance = PropositionalSequent()
    val parser = PropositionalParser()

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("(a & b) & (b |c)", null)

        val treesize = state.tree.size

        state = instance.applyMoveOnState(state, AndRight(0, 0))

        val formula1 = parser.parse("a & b")
        val formula2 = parser.parse("b | c")

        val node1 = state.tree[state.tree.size - 2]
        val node2 = state.tree[state.tree.size - 1]

        assertTrue(node1.rightFormulas[0].synEq(formula1))
        assertTrue(node2.rightFormulas[0].synEq(formula2))

        assertEquals(treesize + 2, state.tree.size)
    }

    @Test
    fun testParent() {
        var state = instance.parseFormulaToState("(a & b) & (b |c)", null)

        state = instance.applyMoveOnState(state, AndRight(0, 0))

        val node1 = state.tree[state.tree.size - 2]

        assertNotNull(node1.parent)
        assertTrue(state.tree[node1.parent!!].children.size == 2)
    }

    @Test
    fun testWrongNode() {
        val state = instance.parseFormulaToState("(a & b) | (b |c)", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, AndRight(0, 0))
        }
    }
}
