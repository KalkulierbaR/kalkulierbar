package kalkulierbar.logic.transform

import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertEquals

class TestSkolemNormalForm {
    private val parser = FirstOrderParser()

    private val formulas = mapOf(
            "R(a) -> R(b) | R(a) & !R(b)" to "(!R(a) ∨ (R(b) ∨ (R(a) ∧ !R(b))))",
            "!(R(a) | R(b))" to "(!R(a) ∧ !R(b))",
            "!(R(a) & R(b))" to "(!R(a) ∨ !R(b))",
            "!(!R(a) <-> !R(a))" to "((R(a) ∨ R(a)) ∧ (!R(a) ∨ !R(a)))",

            "!\\ex A : !(S(A) & !\\all B : (R(B) -> !R(A)))" to "(∀A: (S(A) ∧ (R(sk-1(A)) ∧ R(A))))",
            "!\\all A : (P(A) <-> \\ex C : (R(A) <-> !R(C)))" to
                    "(∀C: ((!P(sk-1) ∨ ((!R(sk-1) ∨ R(C)) ∧ (R(sk-1) ∨ !R(C)))) ∧ (P(sk-1) ∨ " +
                    "((R(sk-1) ∧ !R(sk-2)) ∨ (!R(sk-1) ∧ R(sk-2))))))",
            "!\\ex A : R(A) -> !\\all B : !(R(B) | !R(B))" to "(R(sk-1) ∨ (R(sk-2) ∨ !R(sk-2)))"
    )

    @Test
    fun testValid() {
        for ((f, e) in formulas) {
            val parsed = parser.parse(f)
            assertEquals(e, SkolemNormalForm.transform(parsed).toString())
        }
    }
}
