package kalkulierbar.propsequent

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.PropositionalParser
import kalkulierbar.sequent.Ax
import kalkulierbar.sequent.NotRight
import kalkulierbar.sequent.OrRight
import kalkulierbar.sequent.prop.PropositionalSequent
import kotlin.test.Test
import kotlin.test.assertFailsWith
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class TestAx {

    val instance = PropositionalSequent()
    val parser = PropositionalParser()

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("a | !a", null)

        state = instance.applyMoveOnState(state, OrRight(0, 0))
        state = instance.applyMoveOnState(state, NotRight(1, 1))

        state = instance.applyMoveOnState(state, Ax(2))

        state.tree.forEach { assertTrue(it.isClosed) }
    }

    @Test
    fun testParent() {
        var state = instance.parseFormulaToState("a | !a", null)

        state = instance.applyMoveOnState(state, OrRight(0, 0))
        state = instance.applyMoveOnState(state, NotRight(1, 1))

        state = instance.applyMoveOnState(state, Ax(2))

        val node = state.tree[state.tree.size - 1]

        assertNotNull(node.parent)
        assert(state.tree[node.parent!!].children.size == 1)
    }

    @Test
    fun testFail() {
        val state = instance.parseFormulaToState("a | !a", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, Ax(0))
        }
    }
}
