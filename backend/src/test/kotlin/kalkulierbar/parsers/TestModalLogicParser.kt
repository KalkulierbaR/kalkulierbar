package kalkulierbar.tests.parsers

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.parsers.ModalLogicParser
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestModalLogicParser {
    private val parser = ModalLogicParser()

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
            "(a|b")
        


    private val valid = mapOf(
            "a" to "a",
            "!a" to "¬a",
            "a -> b" to "(a --> b)",
            "a-> b" to "(a --> b)",
            "a    ->b" to "(a --> b)",
            "a->b" to "(a --> b)",
            "a<->(b -> (!(c)))" to "(a <=> (b --> ¬c))",
            "(b & a <-> (a) | !b)" to "((b ∧ a) <=> (a ∨ ¬b))",
            "[]a" to "[]a",
            "[](a&b)" to "[](a ∧ b)",
            "<>(a&b)" to "<>(a ∧ b)",
            "[]<>(a)" to "[]<>a",
            "[][](a)" to "[][]a"
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