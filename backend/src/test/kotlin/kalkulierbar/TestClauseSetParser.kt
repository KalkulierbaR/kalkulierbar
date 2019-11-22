package kalkulierbar.tests

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.parsers.ClauseSetParser
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class TestClauseSetParser {

    val invalidStrings = listOf("", ",a", "a;", ";a", "a,b,;c", "a,b,", "a,b;", "a;;b,c;d", "!!a", "a,!!b;c", "a,!")

    val valid = listOf(
        Pair("a", "{a}"),
        Pair("!a", "{!a}"),
        Pair("a;b", "{a}, {b}"),
        Pair("a,b", "{a, b}"),
        Pair("fUnkYvAR;!McVariable,thefirst", "{fUnkYvAR}, {!McVariable, thefirst}")
        )

    val validNonGeneric = listOf(
        Pair("a", "{a}"),
        Pair("!a", "{!a}"),
        Pair("a|b", "{a}, {b}"),
        Pair("a&b", "{a, b}"),
        Pair("fUnkYvAR|!McVariable&thefirst", "{fUnkYvAR}, {!McVariable, thefirst}")
        )

    @Test
    fun testInvalidStrings() {
        for (tv: String in invalidStrings) {
            Assertions.assertThrows(InvalidFormulaFormat::class.java) {
                ClauseSetParser.parse(tv)
            }
        }
    }

    @Test
    fun testValidStrings() {
        for (tv: Pair<String, String> in valid) {
            Assertions.assertEquals(tv.second, ClauseSetParser.parse(tv.first).toString())
        }
    }

    @Test
    fun testValidNonGeneric() {
        for (tv: Pair<String, String> in validNonGeneric) {
            Assertions.assertEquals(tv.second, ClauseSetParser.parseGeneric(tv.first, "|", "&").toString())
        }
    }
}
