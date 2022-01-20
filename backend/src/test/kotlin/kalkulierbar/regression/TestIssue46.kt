package kalkulierbar.regression

import kalkulierbar.logic.transform.NegationNormalForm
import kalkulierbar.logic.transform.UniqueVariables
import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertEquals

// based on issue #46 in internal gitlab, now inaccessible
class TestIssue46 {

    private val testStrings = mapOf(
        "\\all X: Q(X,X) <=> R(c)" to "(((∀X: Q(X, X)) ∧ R(c)) ∨ ((∃Xv1: ¬Q(Xv1, Xv1)) ∧ ¬R(c)))",
        "\\ex X: \\ex X: R(X, X)" to "(∃X: (∃Xv1: R(Xv1, Xv1)))"
    )

    @Test
    fun testTransformation() {
        for ((formula, expected) in testStrings) {
            val parsed = FirstOrderParser.parse(formula)
            println(parsed)
            val nnf = NegationNormalForm.transform(parsed)
            println(nnf)
            val transformed = UniqueVariables.transform(nnf)
            println(transformed)
            assertEquals(expected, transformed.toString())
        }
    }
}
