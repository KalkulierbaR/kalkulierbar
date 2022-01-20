package kalkulierbar.signedtableaux

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.ModalLogicParser
import kotlin.test.Test
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class TestNegation {
    val instance = SignedModalTableaux()
    val parser = ModalLogicParser()

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("!(!a)", null)

        state = instance.applyMoveOnState(state, Negation(0, null))
        state = instance.applyMoveOnState(state, Negation(1, null))

        val formula1 = parser.parse("!a")
        val formula2 = parser.parse("a")
        val nodes = state.tree

        assertTrue(nodes[1].formula.synEq(formula1))
        assertTrue(nodes[2].formula.synEq(formula2))
    }

    @Test
    fun testComplex() {
        var state = instance.parseFormulaToState("!(a | b)", null)

        state = instance.applyMoveOnState(state, Negation(0, null))
        state = instance.applyMoveOnState(state, BetaMove(1, null))

        val formula = parser.parse("a | b")

        val state1 = instance.applyMoveOnState(state, Negation(0, 2))
        val nodes1 = state1.tree

        assertTrue(nodes1[4].formula.synEq(formula))

        val state2 = instance.applyMoveOnState(state, Negation(0, 3))
        val nodes2 = state2.tree
        assertTrue(nodes2[4].formula.synEq(formula))
    }

    @Test
    fun testWrongNode() {
        val state = instance.parseFormulaToState("a & b", null)
        assertFailsWith<IllegalMove> { instance.applyMoveOnState(state, Negation(0, null)) }
    }
}
