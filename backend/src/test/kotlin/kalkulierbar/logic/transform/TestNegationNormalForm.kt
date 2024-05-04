package kalkulierbar.logic.transform

import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertEquals

class TestNegationNormalForm {
    private val parser = FirstOrderParser()

    private val formulas = mapOf(
        "R(a) -> R(b)" to "(¬R(a) ∨ R(b))",
        "!(R(a) | R(b))" to "(¬R(a) ∧ ¬R(b))",
        "!(R(a) & R(b))" to "(¬R(a) ∨ ¬R(b))",
        "!(!R(a))" to "R(a)",
        "!\\ex A : R(A)" to "(∀A: ¬R(A))",
        "!\\all A : R(A)" to "(∃A: ¬R(A))",
    )

    @Test
    fun testValid() {
        for ((f, e) in formulas) {
            val parsed = parser.parse(f)
            assertEquals(e, NegationNormalForm.transform(parsed).toString())
        }
    }
}
