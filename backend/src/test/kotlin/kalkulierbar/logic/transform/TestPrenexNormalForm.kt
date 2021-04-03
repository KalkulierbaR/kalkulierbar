package kalkulierbar.logic.transform

import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertEquals

class TestPrenexNormalForm {
    private val parser = FirstOrderParser()

    private val formulas = mapOf(
            "R(a) -> R(b) | R(a) & !R(b)" to "(R(a) → (R(b) ∨ (R(a) ∧ ¬R(b))))",
            "!(R(a) | R(b))" to "¬(R(a) ∨ R(b))",
            "!(R(a) & R(b))" to "¬(R(a) ∧ R(b))",
            "!(!R(a) <-> !R(a))" to "¬(¬R(a) <=> ¬R(a))",

            "!\\ex A : !(S(A) & !\\all B : (R(B) -> !R(A)))" to "(∃A: (∀B: ¬¬(S(A) ∧ ¬(R(B) → ¬R(A)))))",
            "!\\all A : (P(A) <-> \\all C : (R(A) <-> !R(C)))" to "(∀A: (∀C: ¬(P(A) <=> (R(A) <=> ¬R(C)))))",
            "!\\ex A : R(A) -> !\\all B : !(R(B) | !R(B))" to "(∃A: (∀B: (¬R(A) → ¬¬(R(B) ∨ ¬R(B)))))"
    )

    @Test
    fun testValid() {
        for ((f, e) in formulas) {
            val parsed = parser.parse(f)
            assertEquals(e, PrenexNormalForm.transform(parsed).toString())
        }
    }
}
