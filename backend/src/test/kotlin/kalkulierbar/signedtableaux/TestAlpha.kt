package kalkulierbar.signedtableaux

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.ModalLogicParser
import kotlin.test.Test
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class TestAlpha {
    val instance = SignedModalTableaux()
    val parser = ModalLogicParser()

    @Test
    fun testBasicAnd() {
        var state = instance.parseFormulaToState("!(a & b)", null)

        println(state.assumption)

        state = instance.applyMoveOnState(state, Negation(0, null))

        println(state.assumption)

        state = instance.applyMoveOnState(state, AlphaMove(1, null))
        val nodes = state.tree

        var state2 = instance.parseFormulaToState("!a", null)
        state2 = instance.applyMoveOnState(state2, Negation(0, null))
        var state3 = instance.parseFormulaToState("!b", null)
        state3 = instance.applyMoveOnState(state3, Negation(0, null))

        assertTrue(state.tree[1].children.size == 1)
        assertTrue(nodes[2].formula.synEq(state2.tree[1].formula))
        assertTrue(nodes[3].formula.synEq(state3.tree[1].formula))
    }

    @Test
    fun testWrongAnd() {
        var state = instance.parseFormulaToState("a & b", null)
        assertFailsWith<IllegalMove> { instance.applyMoveOnState(state, AlphaMove(0, null)) }
    }

    @Test
    fun testBasicOr() {
        var state = instance.parseFormulaToState("a | b", null)
        val nodes = state.tree

        state = instance.applyMoveOnState(state, AlphaMove(0, null))

        val formula1 = parser.parse("a")
        val formula2 = parser.parse("b")

        assertTrue(state.tree[0].children.size == 1)
        assertTrue(nodes[1].formula.synEq(formula1))
        assertTrue(nodes[2].formula.synEq(formula2))
    }

    @Test
    fun testWrongOr() {
        var state = instance.parseFormulaToState("!(a | b)", null)
        state = instance.applyMoveOnState(state, Negation(0, null))
        assertFailsWith<IllegalMove> { instance.applyMoveOnState(state, AlphaMove(1, null)) }
    }

    @Test
    fun testBasicImpl() {
        var state = instance.parseFormulaToState("a -> b", null)

        state = instance.applyMoveOnState(state, AlphaMove(0, null))
        val nodes = state.tree

        var state2 = instance.parseFormulaToState("!a", null)
        state2 = instance.applyMoveOnState(state2, Negation(0, null))
        val formula1 = state2.tree[1].formula

        val formula2 = parser.parse("b")

        assertTrue(state.tree[0].children.size == 1)
        assertTrue(nodes[1].formula.synEq(formula1))
        assertTrue(nodes[2].formula.synEq(formula2))
    }

    @Test
    fun testWrongImpl() {
        var state = instance.parseFormulaToState("!(a -> b)", null)
        state = instance.applyMoveOnState(state, Negation(0, null))
        assertFailsWith<IllegalMove> { instance.applyMoveOnState(state, AlphaMove(1, null)) }
    }
}
