package kalkulierbar.tests.parsers

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.parsers.ModalLogicParser
import kalkulierbar.signedtableaux.SignedModalTableaux
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestModalLogicParser {
    private val parser = ModalLogicParser()
    private val instance = SignedModalTableaux()

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
        "(a|b"
    )

    private val invalidSigned = listOf(
        "\\sign B: a",
        "\\sign T : a",
        "\\sig n T: a",
        "\\si gn T: a",
        "\\s ign T: a",
        "\\ sign T: a",
        "\\sign FT: a",
        "\\signT: a",
        "\\sign T: a & b \\sign T: a",
        "a & b \\sign T: a",
        "a & \\sign T: a",
        "\\sign TF: a"
    )

    private val validSigned = listOf(
        "\\sign T: a" to "a",
        "\\sign F: a" to "a",
        "     \\sign T: a" to "a",
        "     \\sign F: a" to "a",
        "\\sign       T: a" to "a",
        "\\sign       F: a" to "a",
        "\\sign T:      a" to "a",
        "\\sign F:      a" to "a",
        "   \\sign       T: a" to "a",
        "   \\sign       F: a" to "a"
    )

    private val valid = mapOf(
        "a" to "a",
        "!a" to "¬a",
        "a -> b" to "(a → b)",
        "a-> b" to "(a → b)",
        "a    ->b" to "(a → b)",
        "a->b" to "(a → b)",
        "a<->(b -> (!(c)))" to "(a <=> (b → ¬c))",
        "(b & a <-> (a) | !b)" to "((b ∧ a) <=> (a ∨ ¬b))",
        "[]a" to "□a",
        "[](a&b)" to "□(a ∧ b)",
        "<>(a&b)" to "◇(a ∧ b)",
        "[]<>(a)" to "□◇a",
        "[][](a)" to "□□a"
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

    @Test
    fun testInvalidStringsWithSign() {
        for (formula in invalidSigned) {
            assertFailsWith<InvalidFormulaFormat> {
                instance.parseFormulaToState(formula, null)
            }
        }
    }

    @Test
    fun testValidStringsWithSign() {
        for ((formula, expected) in validSigned) {
            val state = instance.parseFormulaToState(formula, null)
            assertEquals(expected, state.nodes[0].formula.toString())
            if (formula.contains("T")) {
                assertEquals(true, state.assumption)
            } else {
                assertEquals(false, state.assumption)
            }
        }
    }
}
