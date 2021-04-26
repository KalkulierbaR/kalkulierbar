package kalkulierbar.nonclausaltableaux

import kalkulierbar.IllegalMove
import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertFailsWith

class TestClose {

    val instance = NonClausalTableaux()

    @Test
    fun testInvalidIndex() {
        val formula = FirstOrderParser.parse("P(c) & !P(c)")
        var state = NcTableauxState(formula)

        state = instance.applyMoveOnState(state, AlphaMove(0))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, CloseMove(3, 0, null))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, CloseMove(-1, 0, null))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, CloseMove(1, 0, null))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, CloseMove(2, -1, null))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, CloseMove(2, 3, null))
        }
    }

    @Test
    fun testInvalidAncestry() {
        val formula = FirstOrderParser.parse("P(c) | !P(c)")
        var state = NcTableauxState(formula)

        state = instance.applyMoveOnState(state, BetaMove(0))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, CloseMove(2, 1, null))
        }
    }

    @Test
    fun testInvalidPolarity() {
        var state = instance.parseFormulaToState("!P(c) & !P(c)", null)

        state = instance.applyMoveOnState(state, AlphaMove(0))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, CloseMove(2, 1, null))
        }

        state = instance.parseFormulaToState("P(c) & P(c)", null)

        state = instance.applyMoveOnState(state, AlphaMove(0))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, CloseMove(2, 1, null))
        }
    }

    @Test
    fun testIncompatible() {
        var state = instance.parseFormulaToState("!P(c) & R(c)", null)

        state = instance.applyMoveOnState(state, AlphaMove(0))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, CloseMove(2, 1, null))
        }

        state = instance.parseFormulaToState("P(c) & P(c,q)", null)

        state = instance.applyMoveOnState(state, AlphaMove(0))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, CloseMove(2, 1, null))
        }
    }

    @Test
    fun testIncompatibleManual() {
        var state = instance.parseFormulaToState("/all X: (!P(X) & P(f(X)))", null)

        state = instance.applyMoveOnState(state, GammaMove(0))
        state = instance.applyMoveOnState(state, AlphaMove(1))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, CloseMove(3, 2, mapOf("X_1" to "c")))
        }

        assertFailsWith<InvalidFormulaFormat> {
            instance.applyMoveOnState(state, CloseMove(3, 2, mapOf("X_1" to "not a term")))
        }
    }

    @Test
    fun testAlreadyClosed() {
        var state = instance.parseFormulaToState("/all X: (!P(X) & P(f(c)))", null)

        state = instance.applyMoveOnState(state, GammaMove(0))
        state = instance.applyMoveOnState(state, AlphaMove(1))

        state = instance.applyMoveOnState(state, CloseMove(3, 2, null))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, CloseMove(3, 2, null))
        }
    }

    @Test
    fun testValid() {
        var state = instance.parseFormulaToState("/all X: (!P(X) & P(f(c)))", null)

        state = instance.applyMoveOnState(state, GammaMove(0))
        state = instance.applyMoveOnState(state, AlphaMove(1))

        state = instance.applyMoveOnState(state, CloseMove(3, 2, null))

        assert(instance.checkCloseOnState(state).closed)
    }

    @Test
    fun testValidManual() {
        var state = instance.parseFormulaToState("/all X: (!P(X) & P(f(c)))", null)

        state = instance.applyMoveOnState(state, GammaMove(0))
        state = instance.applyMoveOnState(state, AlphaMove(1))

        instance.applyMoveOnState(state, CloseMove(3, 2, mapOf("X_1" to "f(c)")))

        assert(instance.checkCloseOnState(state).closed)
    }
}
