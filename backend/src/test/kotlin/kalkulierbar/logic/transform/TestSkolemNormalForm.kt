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

            "!\\ex A : !(S(A) & !\\all B : (R(B) -> !R(A)))" to "(∀A: (S(A) ∧ (R(sk1(A)) ∧ R(A))))",
            // "!\\all A : (P(A) <-> \\ex C : (R(A) <-> !R(C)))" to "",
            "!\\ex A : R(A) -> !\\all B : !(R(B) | !R(B))" to "(R(sk1) ∨ (R(sk2) ∨ !R(sk2)))"
    )

    @Test
    fun testValid() {
        for ((f, e) in formulas) {
            val parsed = parser.parse(f)
            assertEquals(e, SkolemNormalForm.transform(parsed).toString())
        }
    }
}
