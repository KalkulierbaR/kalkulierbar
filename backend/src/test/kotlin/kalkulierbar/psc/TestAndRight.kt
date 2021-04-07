package kalkulierbar.psc

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.PropositionalParser
import kalkulierbar.sequent.*
import kalkulierbar.sequent.psc.PSC
import kotlin.test.*
import kotlin.test.assertEquals

class TestAndRight {

    val instance = PSC()
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
        var state = instance.parseFormulaToState("(a & b) | (b |c)", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, AndRight(0, 0))
        }
    }
}
