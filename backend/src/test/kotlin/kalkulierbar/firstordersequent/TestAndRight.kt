package kalkulierbar.firstordersequent

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.sequent.AndRight
import kalkulierbar.sequent.fo.FirstOrderSequent
import kotlin.test.*

class TestAndRight {

    val instance = FirstOrderSequent()
    val parser = FirstOrderParser()

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("(P(a) & P(b)) & (P(b) |P(c))", null)

        val treesize = state.tree.size

        state = instance.applyMoveOnState(state, AndRight(0, 0))

        val formula1 = parser.parse("P(a) & P(b)")
        val formula2 = parser.parse("P(b) | P(c)")

        val node1 = state.tree[state.tree.size - 2]
        val node2 = state.tree[state.tree.size - 1]

        assertTrue(node1.rightFormulas[0].synEq(formula1))
        assertTrue(node2.rightFormulas[0].synEq(formula2))

        assertEquals(treesize + 2, state.tree.size)
    }

    @Test
    fun testParent() {
        var state = instance.parseFormulaToState("(P(a) & P(b)) & (P(b) |P(c))", null)

        state = instance.applyMoveOnState(state, AndRight(0, 0))

        val node1 = state.tree[state.tree.size - 2]

        assertNotNull(node1.parent)
        assertTrue(state.tree[node1.parent!!].children.size == 2)
    }

    @Test
    fun testWrongNode() {
        val state = instance.parseFormulaToState("P(a) | P(b)", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, AndRight(0, 0))
        }
    }
}
