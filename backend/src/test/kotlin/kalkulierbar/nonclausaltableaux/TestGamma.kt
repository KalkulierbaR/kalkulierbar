package kalkulierbar.nonclausaltableaux

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestGamma {
    val instance = NonClausalTableaux()

    @Test
    fun testInvalidFormula() {
        val formula = FirstOrderParser.parse("/ex X: P(X)")
        val state = NcTableauxState(formula)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, GammaMove(0))
        }
    }

    @Test
    fun testInvalidIndex() {
        val formula = FirstOrderParser.parse("/all X: P(X)")
        val state = NcTableauxState(formula)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, GammaMove(1))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, GammaMove(-1))
        }
    }

    @Test
    fun testBasic() {
        val formula = FirstOrderParser.parse("/all X: P(X)")
        var state = NcTableauxState(formula)

        state = instance.applyMoveOnState(state, GammaMove(0))

        assertEquals("P(X_1)", state.tree[1].spelling)
        assertEquals(0, state.tree[1].parent)
        assertEquals(2, state.tree.size)
    }

    @Test
    fun testScoping() {
        val formula = FirstOrderParser.parse("/all X: (P(X, f(X, g(c, X))) & Q(X) & /all X: C(X))")
        var state = NcTableauxState(formula)

        state = instance.applyMoveOnState(state, GammaMove(0))

        assertEquals("((P(X_1, f(X_1, g(c, X_1))) ∧ Q(X_1)) ∧ (∀X: C(X)))", state.tree[1].spelling)
        assertEquals(0, state.tree[1].parent)
        assertEquals(2, state.tree.size)
    }

    @Test
    fun testSuffixCounter() {
        val formula = FirstOrderParser.parse("/all X: /all Y: /all Z: R(X, Y, Z)")
        var state = NcTableauxState(formula)

        state = instance.applyMoveOnState(state, GammaMove(0))

        assertEquals("(∀Y: (∀Z: R(X_1, Y, Z)))", state.tree[1].spelling)
        assertEquals(0, state.tree[1].parent)

        state = instance.applyMoveOnState(state, GammaMove(1))

        assertEquals("(∀Z: R(X_1, Y_2, Z))", state.tree[2].spelling)
        assertEquals(1, state.tree[2].parent)

        state = instance.applyMoveOnState(state, GammaMove(2))

        assertEquals("R(X_1, Y_2, Z_3)", state.tree[3].spelling)
        assertEquals(2, state.tree[3].parent)
    }
}
