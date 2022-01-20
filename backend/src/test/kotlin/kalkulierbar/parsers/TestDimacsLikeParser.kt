package kalkulierbar.parsers

import kalkulierbar.InvalidFormulaFormat
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestDimacsLikeParser {

    val invalidStrings = listOf("", " a", "0 a", "a b  0 c", "a b ", "a 0 0 b c 0 d", "--a", "a --b 0 c", "a -", "a 0 0")

    val valid = listOf(
        Pair("a", "{a}"),
        Pair("-a", "{!a}"),
        Pair("a 0 b", "{a}, {b}"),
        Pair("a b", "{a, b}"),
        Pair("a b 0 c", "{a, b}, {c}"),
        Pair("a\n 0 b", "{a}, {b}"),
        Pair("a 0 b 0", "{a}, {b}"),
        Pair("fUnkYvAR 0 -McVariable thefirst", "{fUnkYvAR}, {!McVariable, thefirst}"),
        Pair("1 -2 0 3", "{1, !2}, {3}")
    )

    @Test
    fun testInvalidStrings() {
        for (tv: String in invalidStrings) {
            assertFailsWith<InvalidFormulaFormat> {
                DimacsLikeParser.parse(tv)
            }
        }
    }

    @Test
    fun testValidStrings() {
        for (tv: Pair<String, String> in valid) {
            assertEquals(tv.second, DimacsLikeParser.parse(tv.first).toString())
        }
    }
}
