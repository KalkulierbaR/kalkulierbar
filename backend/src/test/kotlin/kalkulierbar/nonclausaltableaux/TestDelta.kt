package kalkulierbar.nonclausaltableaux

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestDelta {

    val instance = NonClausalTableaux()

    @Test
    fun testInvalidFormula() {
        val formula = FirstOrderParser.parse("/all X: P(X)")
        val state = NcTableauxState(formula)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, DeltaMove(0))
        }
    }

    @Test
    fun testInvalidIndex() {
        val formula = FirstOrderParser.parse("/ex X: P(X)")
        val state = NcTableauxState(formula)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, DeltaMove(1))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, DeltaMove(-1))
        }
    }

    @Test
    fun testBasic() {
        val formula = FirstOrderParser.parse("/ex X: P(X)")
        var state = NcTableauxState(formula)

        state = instance.applyMoveOnState(state, DeltaMove(0))

        assertEquals("P(sk1)", state.tree[1].spelling)
        assertEquals(0, state.tree[1].parent)
        assertEquals(2, state.tree.size)
    }

    @Test
    fun testScoping() {
        val formula = FirstOrderParser.parse("/ex X: (P(X, f(X, g(c, X))) & Q(X) & /all X: C(X))")
        var state = NcTableauxState(formula)

        state = instance.applyMoveOnState(state, DeltaMove(0))

        assertEquals("((P(sk1, f(sk1, g(c, sk1))) ∧ Q(sk1)) ∧ (∀X: C(X)))", state.tree[1].spelling)
        assertEquals(0, state.tree[1].parent)
        assertEquals(2, state.tree.size)
    }

    @Test
    fun testFreeVars() {
        val formula = FirstOrderParser.parse("/all Y: /ex X: (P(X, f(X, g(Y, X))) & Q(X))")
        var state = NcTableauxState(formula)

        state = instance.applyMoveOnState(state, GammaMove(0))
        state = instance.applyMoveOnState(state, DeltaMove(1))

        assertEquals("(P(sk1(Y_1), f(sk1(Y_1), g(Y_1, sk1(Y_1)))) ∧ Q(sk1(Y_1)))", state.tree[2].spelling)
        assertEquals(1, state.tree[2].parent)
        assertEquals(3, state.tree.size)
    }

    @Test
    fun testSkolemCounter() {
        val formula = FirstOrderParser.parse("/ex Y: /ex X: P(sk2, Y, X)")
        var state = NcTableauxState(formula)

        state = instance.applyMoveOnState(state, DeltaMove(0))
        state = instance.applyMoveOnState(state, DeltaMove(1))

        assertEquals("P(sk2, sk1, sk3)", state.tree[2].spelling)
        assertEquals(1, state.tree[2].parent)
        assertEquals(3, state.tree.size)
    }
}
