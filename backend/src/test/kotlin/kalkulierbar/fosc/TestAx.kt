package kalkulierbar.fosc

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.sequentCalculus.*
import kalkulierbar.sequentCalculus.fosc.FOSC
import kotlin.test.*

class TestAx {

    val instance = FOSC()
    val parser = FirstOrderParser()

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("P(a) | !P(a)", null)

        state = instance.applyMoveOnState(state, OrRight(0, 0))
        state = instance.applyMoveOnState(state, NotRight(1, 1))

        state = instance.applyMoveOnState(state, Ax(2))

        state.tree.forEach { assertTrue(it.isClosed) }
    }

    @Test
    fun testParent() {
        var state = instance.parseFormulaToState("P(a) | !P(a)", null)

        state = instance.applyMoveOnState(state, OrRight(0, 0))
        state = instance.applyMoveOnState(state, NotRight(1, 1))

        state = instance.applyMoveOnState(state, Ax(2))

        val node = state.tree[state.tree.size - 1]

        assertNotNull(node.parent)
        assert(state.tree[node.parent!!].children.size == 1)
    }

    @Test
    fun testFail() {
        var state = instance.parseFormulaToState("P(a) | !P(a)", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, Ax(0))
        }
    }
}
