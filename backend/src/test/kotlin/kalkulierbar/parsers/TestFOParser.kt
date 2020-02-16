package kalkulierbar.tests.parsers

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestFOParser {
    private val parser = FirstOrderParser()

    private val invalid = listOf(
            "",
            "-->a",
            "<--",
            "--><=>",
            "!->",
            "a!",
            "a-->",
            "b<=>",
            "<->a",
            "<->",
            "(a&b v2",
            "(a|b",
            "X",
            "R(X)",
            "\\all X: P(\\all: X: P(X))",
            "\\all X: P(Y)",
            "\\all x: P(X)",
            "\\all X P(X)")

    private val valid = mapOf(
            "P(c)" to "P(c)",
            "\\all X: P(X)" to "(∀X: P(X))",
            "\\all X:P(X)" to "(∀X: P(X))",
            "\\all X:           P(X)" to "(∀X: P(X))",
            "\\all X: \\all Y: \\all Z: R(m(X, m(Y, Z)), m(m(X,Y, Z)))" to "(∀X: (∀Y: (∀Z: R(m(X, m(Y, Z)), m(m(X, Y, Z))))))",
            "\\ex Xyz: P(Xyz)" to "(∃Xyz: P(Xyz))",
            "!\\ex X: (P(X) <-> !P(X))" to "!(∃X: (P(X) <=> !P(X)))",
            "!(\\ex X: (P(X) <-> !P(X)))" to "!(∃X: (P(X) <=> !P(X)))",
            "\\ex Xyz: P(Xyz) & \\all X: P(X)" to "((∃Xyz: P(Xyz)) ∧ (∀X: P(X)))",
            "!/ex X: (P(X) <-> !P(X))" to "!(∃X: (P(X) <=> !P(X)))",
            "!(/ex X: (P(X) <-> !P(X)))" to "!(∃X: (P(X) <=> !P(X)))",
            "/ex Xyz: P(Xyz) & /all X: P(X)" to "((∃Xyz: P(Xyz)) ∧ (∀X: P(X)))"
    )

    @Test
    fun testInvalidStrings() {
        for (s in invalid) {
            assertFailsWith<InvalidFormulaFormat> {
                parser.parse(s)
            }
        }
    }

    @Test
    fun testValidStrings() {
        for ((formula, expected) in valid) {
            assertEquals(expected, parser.parse(formula).toString())
        }
    }
}
