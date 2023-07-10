package kalkulierbar.firstordersequent

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.sequent.AllRight
import kalkulierbar.sequent.fo.FirstOrderSequent
import kotlin.test.Test
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class TestAllRight {
    val instance = FirstOrderSequent()
    val parser = FirstOrderParser()
    private val instTerm = "a"

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("\\all X: R(X)", null)

        state = instance.applyMoveOnState(state, AllRight(0, 0, instTerm))

        assertTrue(state.tree.size == 2)
        assertTrue(state.tree[0].parent == null)
        assertTrue(state.tree[0].children.size == 1)
        assertTrue(state.tree[0].children[0] == 1)
        assertTrue(state.tree[1].parent == 0)

        val formula1 = parser.parse("R(a)")

        assertTrue(state.tree[1].leftFormulas.size == 0)
        assertTrue(state.tree[1].rightFormulas.size == 1)
        assertTrue(state.tree[1].rightFormulas[0].synEq(formula1))
    }

    @Test
    fun testWrongInstantiation() {
        val state = instance.parseFormulaToState("\\all X: R(X), P(a)", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, AllRight(0, 0, instTerm))
        }
    }

    @Test
    fun testWrongNode() {
        val state = instance.parseFormulaToState("\\ex X: R(X)", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, AllRight(0, 0, instTerm))
        }
    }
}
