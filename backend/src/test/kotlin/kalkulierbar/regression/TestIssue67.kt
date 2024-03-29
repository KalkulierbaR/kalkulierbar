package kalkulierbar.regression

import kalkulierbar.resolution.FirstOrderResolution
import kalkulierbar.resolution.MoveHyper
import kalkulierbar.resolution.PropositionalResolution
import kotlin.test.Test
import kotlin.test.assertEquals

// based on issue #67 in internal gitlab, now inaccessible
class TestIssue67 {
    @Test
    fun testProp() {
        val prop = PropositionalResolution()
        var state = prop.parseFormulaToState("a,!b,c,!d,!e; b; d; e", null)
        state = prop.applyMoveOnState(state, MoveHyper(0, mapOf(1 to Pair(1, 0), 3 to Pair(2, 0), 4 to Pair(3, 0))))
        assertEquals("{a, !b, c, !d, !e}, {b}, {d}, {e}, {a, c}", state.clauseSet.toString())
    }

    @Test
    fun testFO() {
        val fo = FirstOrderResolution()
        var state = fo.parseFormulaToState("/all X: ((!R(c) | R(f) | !R(X)) & R(c) & R(X))", null)
        state = fo.applyMoveOnState(state, MoveHyper(0, mapOf(0 to Pair(1, 0), 2 to Pair(2, 0))))
        assertEquals("{!R(c), R(f), !R(X_1)}, {R(c)}, {R(X_3)}, {R(f)}", state.clauseSet.toString())
    }
}
