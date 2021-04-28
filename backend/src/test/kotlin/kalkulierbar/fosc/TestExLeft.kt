package kalkulierbar.fosc

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.sequent.ExLeft
import kalkulierbar.sequent.fosc.FOSC
import kotlin.test.Test
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class TestExLeft {
    val instance = FOSC()
    val parser = FirstOrderParser()
    val varAssign = mapOf("X" to "a")

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("\\ex X: R(X) |-", null)

        state = instance.applyMoveOnState(state, ExLeft(0, 0, varAssign))

        assertTrue(state.tree.size == 2)
        assertTrue(state.tree[0].parent == null)
        assertTrue(state.tree[0].children.size == 1)
        assertTrue(state.tree[0].children[0] == 1)
        assertTrue(state.tree[1].parent == 0)

        val formula1 = parser.parse("R(a)")

        assertTrue(state.tree[1].rightFormulas.size == 0)
        assertTrue(state.tree[1].leftFormulas.size == 1)
        assertTrue(state.tree[1].leftFormulas[0].synEq(formula1))
    }

    @Test
    fun testWrongInstantiation() {
        var state = instance.parseFormulaToState("\\ex X: R(X), P(a) |-", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, ExLeft(0, 0, varAssign))
        }
    }

    @Test
    fun testWrongNode() {
        var state = instance.parseFormulaToState("\\all X: R(X) |-", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, ExLeft(0, 0, varAssign))
        }
    }
}
