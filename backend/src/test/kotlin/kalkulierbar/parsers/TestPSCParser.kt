package kalkulierbar.tests.parsers

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.parsers.PropositionalSequentParser
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestPSCParser {
    private val parser = PropositionalSequentParser()

    private val invalid = listOf(
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
        "|- ,,",
        ",, |-",
        "|- a |-",
        "( |- )",
        "a | |- b",
        "a |- b a"
    )

    private val valid = mapOf(
        "" to " ⊢ ",
        "a" to " ⊢ a",
        "!a" to " ⊢ ¬a",
        "a -> b" to " ⊢ (a → b)",
        "a-> b" to " ⊢ (a → b)",
        "a    ->b" to " ⊢ (a → b)",
        "a->b" to " ⊢ (a → b)",
        "a<->(b -> (!(c)))" to " ⊢ ((a → (b → ¬c)) ∧ ((b → ¬c) → a))",
        "(b & a <-> (a) | !b)" to " ⊢ (((b ∧ a) → (a ∨ ¬b)) ∧ ((a ∨ ¬b) → (b ∧ a)))",
        "|- a" to " ⊢ a",
        "|-!a" to " ⊢ ¬a",
        "    |-    a -> b" to " ⊢ (a → b)",
        " |- a-> b" to " ⊢ (a → b)",
        "|- a    ->b" to " ⊢ (a → b)",
        "a |-" to "a ⊢ ",
        "!a |-" to "¬a ⊢ ",
        "a -> b |-" to "(a → b) ⊢ ",
        "a-> b |-" to "(a → b) ⊢ ",
        "a    ->b |-" to "(a → b) ⊢ ",
        "a->b |-" to "(a → b) ⊢ ",
        "a<->(b -> (!(c))) |-" to "((a → (b → ¬c)) ∧ ((b → ¬c) → a)) ⊢ ",
        "(b & a <-> (a) | !b)                 |-" to "(((b ∧ a) → (a ∨ ¬b)) ∧ ((a ∨ ¬b) → (b ∧ a))) ⊢ ",
        " |- a,b" to " ⊢ a, b",
        "a,b,c,d,e,f |- g,h,i,j,k,l" to "a, b, c, d, e, f ⊢ g, h, i, j, k, l",
        "a & b -> c, a | c |- d <-> e" to "((a ∧ b) → c), (a ∨ c) ⊢ ((d → e) ∧ (e → d))"
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
            assertEquals(expected, parser.parse(formula).tree.get(0).toString())
        }
    }
}
