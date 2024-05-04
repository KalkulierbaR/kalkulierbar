package kalkulierbar.regression

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.transform.Skolemization
import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

// based on issue #48 in internal gitlab, now inaccessible
class TestIssue48 {

    private val testStrings = mapOf(
        "\\ex X: R(X) & (R(sk1) <-> R(usk1))" to "(R(sk2) ∧ (R(sk1) <=> R(usk1)))",
    )

    private val invalid = listOf(
        "\\ex X: R(X) & R(sk-1)",
    )

    @Test
    fun testTransformation() {
        for ((formula, expected) in testStrings) {
            val parsed = FirstOrderParser.parse(formula)
            val transformed = Skolemization.transform(parsed)

            assertEquals(expected, transformed.toString())
        }
    }

    @Test
    fun testInvalid() {
        for (formula in invalid) {
            assertFailsWith<InvalidFormulaFormat> {
                FirstOrderParser.parse(formula)
            }
        }
    }
}
