package kalkulierbar.logic.transform

import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertEquals

class TestSkolemization {
    private val parser = FirstOrderParser()

    private val formulas = mapOf(
            "R(a) -> R(b) | R(a) & !R(b)" to "(R(a) --> (R(b) ∨ (R(a) ∧ !R(b))))",
            "!(R(a) | R(b))" to "!(R(a) ∨ R(b))",
            "!(R(a) & R(b))" to "!(R(a) ∧ R(b))",
            "!(!R(a) <-> !R(a))" to "!(!R(a) <=> !R(a))",

            "\\ex A: R(A) & Q(sk1)" to "(R(sk2) ∧ Q(sk1))",
            "!\\ex A : !(S(A) & !\\all B : (R(B) -> !R(A)))" to "!!(S(sk1) ∧ !(∀B: (R(B) --> !R(sk1))))",
            "!\\all A : (P(A) <-> \\ex C : (R(A) <-> !R(C)))" to "!(∀A: (P(A) <=> (R(A) <=> !R(sk1(A)))))",
            "!\\ex A : R(A) -> !\\all B : !(R(B) | !R(B))" to "(!R(sk1) --> !(∀B: !(R(B) ∨ !R(B))))"
    )

    @Test
    fun testValid() {
        for ((f, e) in formulas) {
            val parsed = parser.parse(f)
            assertEquals(e, Skolemization.transform(parsed).toString())
        }
    }
}
