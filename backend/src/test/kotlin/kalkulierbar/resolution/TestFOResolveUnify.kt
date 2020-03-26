package kalkulierbar.resolution

import kalkulierbar.IllegalMove
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestFOResolveUnify {
    private val inst = FirstOrderResolution()

    private val valid1 = "\\all X: R(f(X, c), X) & !R(f(a,c), a)"

    private val valid2 = "\\all X: R(f(X, c), X) & !\\ex Y: R(f(Y,c), Y)"

    private val valid3 = "\\all X: R(f(X, c), X) & \\ex Y: !R(f(Y,c), Y)"

    private val valid4 = "!R(a) & \\all X:  R(X) & !R(f(g(h(a))))"

    private val valid5 = "(!R(a) | R(c)) & \\all X:  R(X) & (T(a) | !R(f(g(h(a)))))"

    private val invalid1 = "\\all X: R(f(X, c), X) & !R(f(a,a), a)"

    private val invalid2 = "\\all X: R(f(X, c), X) & !\\ex Y: R(f(Y,a), Y)"

    private val invalid3 = "\\all X: R(f(X, c), X) & !\\ex Y: R(f(a,c), b)"

    private fun testFormula(formula: String, move: ResolutionMove, expected: String? = null) {
        val state = inst.parseFormulaToState(formula, null)
        assertEquals(state.clauseSet.clauses.size, state.clauseCounter)

        if (expected == null) {
            assertFailsWith<IllegalMove> {
                inst.applyMoveOnState(state, move)
            }
        } else {
            val res = inst.applyMoveOnState(state, move)
            assertEquals(expected, res.getHash())
        }
    }

    @Test
    fun testValid() {
        testFormula(valid1, MoveResolveUnify(0, 1, 0, 0), "resolutionstate|{R(f(X_1, c), X_1)}, {!R(f(a, c), a)}, {}||NONE|2|3")
        testFormula(valid2, MoveResolveUnify(0, 1, 0, 0), "resolutionstate|{R(f(X_1, c), X_1)}, {!R(f(Y_2, c), Y_2)}, {}||NONE|2|3")
        testFormula(valid3, MoveResolveUnify(0, 1, 0, 0), "resolutionstate|{R(f(X_1, c), X_1)}, {!R(f(sk1, c), sk1)}, {}||NONE|2|3")
        testFormula(valid4, MoveResolveUnify(0, 1, 0, 0), "resolutionstate|{!R(a)}, {R(X_2)}, {!R(f(g(h(a))))}, {}||NONE|3|4")
        testFormula(valid4, MoveResolveUnify(2, 1, 0, 0), "resolutionstate|{!R(a)}, {R(X_2)}, {!R(f(g(h(a))))}, {}||NONE|3|4")
        testFormula(valid5, MoveResolveUnify(2, 1, 1, 0), "resolutionstate|{!R(a), R(c)}, {R(X_2)}, {T(a), !R(f(g(h(a))))}, {T(a)}||NONE|3|4")
    }

    @Test
    fun testInvalid() {
        testFormula(invalid1, MoveResolveUnify(0, 1, 0, 0))
        testFormula(invalid2, MoveResolveUnify(0, 1, 0, 0))
        testFormula(invalid3, MoveResolveUnify(0, 1, 0, 0))

        testFormula(valid1, MoveResolveUnify(-1, 1, 0, 0))
        testFormula(valid2, MoveResolveUnify(0, 2, 0, 0))
        testFormula(valid3, MoveResolveUnify(0, 100, 0, 0))
        testFormula(valid1, MoveResolveUnify(4, 1, 0, 0))
        testFormula(valid2, MoveResolveUnify(0, -2, 0, 0))

        testFormula(valid1, MoveResolveUnify(0, 1, -1, 0))
        testFormula(valid2, MoveResolveUnify(0, 1, 1, 0))
        testFormula(valid3, MoveResolveUnify(0, 1, 0, 2))
        testFormula(valid1, MoveResolveUnify(0, 1, 0, -2))
    }

    @Test
    fun testManual() {
        testFormula(valid1, MoveResolveCustom(0, 1, 0, 0, mapOf("X_1" to "a")), "resolutionstate|{R(f(X_1, c), X_1)}, {!R(f(a, c), a)}, {}||NONE|2|3")
        testFormula(valid2, MoveResolveCustom(0, 1, 0, 0, mapOf("X_1" to "Y_2")), "resolutionstate|{R(f(X_1, c), X_1)}, {!R(f(Y_2, c), Y_2)}, {}||NONE|2|3")
        testFormula(valid3, MoveResolveCustom(0, 1, 0, 0, mapOf("X_1" to "f(nope)")))
    }
}
