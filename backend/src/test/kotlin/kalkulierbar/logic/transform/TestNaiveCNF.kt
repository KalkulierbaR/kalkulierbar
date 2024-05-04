package kalkulierbar.logic.transform

import kalkulierbar.parsers.PropositionalParser
import kotlin.test.Test
import kotlin.test.assertEquals

class TestNaiveCNF {

    private val parser = PropositionalParser()

    private val formulas = mapOf(
        "a -> b" to "{!a, b}",
        "!(a | b)" to "{!a}, {!b}",
        "!(a & b)" to "{!a, !b}",
        "!(!a)" to "{a}",
        "!(a | b) -> !(!a & b)" to "{a, b, a, !b}",
        "a | !b -> !a <-> b & !a | b" to "{!a, !a, a, !b}, {!a, !a, a}, {!a, !a, !b, a}, {!a, !a, !b}, " +
            "{b, !a, a, !b}, {b, !a, a}, {b, !a, !b, a}, {b, !a, !b}, {b, b, a, !b}, {b, b, a}, " +
            "{b, b, !b, a}, {b, b, !b}, {!a, b, a, !b}, {!a, b, a}, {!a, b, !b, a}, {!a, b, !b}",
    )

    @Test
    fun testValid() {
        for ((f, e) in formulas) {
            val parsed = parser.parse(f)
            assertEquals(e, NaiveCNF.transform(parsed).toString())
        }
    }
}
