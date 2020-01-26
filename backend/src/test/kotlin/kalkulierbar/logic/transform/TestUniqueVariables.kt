package kalkulierbar.logic.transform

import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertEquals

class TestUniqueVariables {
    private val parser = FirstOrderParser()

    private val formulas = mapOf(
            "\\all X: (R(X) & \\all X: S(X))" to "(∀X: (R(X) ∧ (∀Xv1: S(Xv1))))"
    )

    @Test
    fun testValid() {
        for ((f, e) in formulas) {
            val parsed = parser.parse(f)
            assertEquals(e, UniqueVariables.transform(parsed).toString())
        }
    }
}
