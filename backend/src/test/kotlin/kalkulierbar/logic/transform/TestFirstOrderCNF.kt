package kalkulierbar.logic.transform

import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertEquals

class TestFirstOrderCNF {
    private val parser = FirstOrderParser()

    private val formulas = mapOf(
            "R(a) -> R(b) | R(a) & !R(b)" to "{!R(a), R(b), R(a)}, {!R(a), R(b), !R(b)}",
            "!(R(a) | R(b))" to "{!R(a)}, {!R(b)}",
            "!(R(a) & R(b))" to "{!R(a), !R(b)}",
            "!(!R(a)) <-> !R(a)" to "{R(a), !R(a)}, {R(a), R(a)}, {!R(a), !R(a)}, {!R(a), R(a)}",
            "!\\ex A : \\all B : (R(B) -> !R(A))" to "{R(sk1(A))}, {R(A)}",
            "!\\all A : \\all C : (R(A) <-> !R(C))" to "{!R(sk1), R(sk2)}, {R(sk1), !R(sk2)}"
    )

    @Test
    fun testValid() {
        for ((f, e) in formulas) {
            val parsed = parser.parse(f)
            assertEquals(e, FirstOrderCNF.transform(parsed).toString())
        }
    }
}
