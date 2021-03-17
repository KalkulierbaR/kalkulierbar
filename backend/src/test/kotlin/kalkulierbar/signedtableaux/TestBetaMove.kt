package kalkulierbar.test.signedtableaux

import kalkulierbar.IllegalMove
import kalkulierbar.logic.*
import kalkulierbar.parsers.ModalLogicParser
import kalkulierbar.signedtableaux.SignedModalTableaux
import kalkulierbar.signedtableaux.BetaMove
import kalkulierbar.signedtableaux.Negation
import kotlin.test.*

class TestBetaMove {
    val instance = SignedModalTableaux()
    val parser = ModalLogicParser()

    @Test
    fun testBasicOr() {
        var state = instance.parseFormulaToState("!(a | b)", null)

        state = instance.applyMoveOnState(state, Negation(0, null))
        state = instance.applyMoveOnState(state, BetaMove(1, null))
        val nodes = state.nodes

        var state2 = instance.parseFormulaToState("!a", null)
        state2 = instance.applyMoveOnState(state2, Negation(0, null))
        var state3 = instance.parseFormulaToState("!b", null)
        state3 = instance.applyMoveOnState(state3, Negation(0, null))

        assertTrue(state.nodes[1].children.size == 2)
        assertTrue(nodes[2].formula.synEq(state2.nodes[1].formula))
        assertTrue(nodes[3].formula.synEq(state3.nodes[1].formula))
    }

    @Test
    fun testWrongOr() {
        var state = instance.parseFormulaToState("a | b", null)
        assertFailsWith<IllegalMove> { instance.applyMoveOnState(state, BetaMove(0, null)) }
    }

    @Test
    fun testBasicAnd() {
        var state = instance.parseFormulaToState("a & b", null)
        val nodes = state.nodes

        state = instance.applyMoveOnState(state, BetaMove(0, null))

        val formula1 = parser.parse("a")
        val formula2 = parser.parse("b")

        assertTrue(state.nodes[0].children.size == 2)
        assertTrue(nodes[1].formula.synEq(formula1))
        assertTrue(nodes[2].formula.synEq(formula2))
    }

    @Test
    fun testWrongAnd() {
        var state = instance.parseFormulaToState("!(a & b)", null)
        state = instance.applyMoveOnState(state, Negation(0, null))
        assertFailsWith<IllegalMove> { instance.applyMoveOnState(state, BetaMove(1, null)) }
    }

    @Test
    fun testBasicImpl() {
        var state = instance.parseFormulaToState("!(a -> b)", null)

        state = instance.applyMoveOnState(state, Negation(0, null))
        state = instance.applyMoveOnState(state, BetaMove(1, null))
        val nodes = state.nodes

        val formula1 = parser.parse("a")
        
        var state2 = instance.parseFormulaToState("!b", null)
        state2 = instance.applyMoveOnState(state2, Negation(0, null))
        val formula2 = state2.nodes[1].formula

        assertTrue(state.nodes[1].children.size == 2)
        assertTrue(nodes[2].formula.synEq(formula1))
        assertTrue(nodes[3].formula.synEq(formula2))
    }

    @Test
    fun testWrongImpl() {
        var state = instance.parseFormulaToState("a -> b", null)
        assertFailsWith<IllegalMove> { instance.applyMoveOnState(state, BetaMove(0, null)) }
    }
}