package kalkulierbar.logic.transform

import kalkulierbar.parsers.PropositionalParser
import kotlin.test.Test
import kotlin.test.assertEquals

class TestTseytinCNF {
    private val parser = PropositionalParser()

    private val formulas =
        mapOf(
            "a -> b" to "{impl0}, {vara, impl0}, {!varb, impl0}, {!vara, varb, !impl0}",
            "!(a | b)" to "{not0}, {!vara, or1}, {!varb, or1}, {vara, varb, !or1}, {!or1, !not0}, {or1, not0}",
            "!(a & b)" to "{not0}, {vara, !and1}, {varb, !and1}, {!vara, !varb, and1}, {!and1, !not0}, {and1, not0}",
            "!(!a)" to "{not0}, {!vara, !not1}, {vara, not1}, {!not1, !not0}, {not1, not0}",
            "a" to "{vara}",
            "!(a | b) -> !(!a & b)" to "{impl0}, {!vara, or2}, {!varb, or2}, {vara, varb, !or2}, {!or2, !not1}, " +
                "{or2, not1}, {!vara, !not7}, {vara, not7}, {not7, !and6}, {varb, !and6}, {!not7, !varb, and6}, " +
                "{!and6, !not5}, {and6, not5}, {not1, impl0}, {!not5, impl0}, {!not1, not5, !impl0}",
            "a | !b -> !a <-> b & !a | b" to "{equiv0}, {!varb, !not4}, {varb, not4}, {!vara, or2}, {!not4, or2}, " +
                "{vara, not4, !or2}, {!vara, !not6}, {vara, not6}, {or2, impl1}, {!not6, impl1}, " +
                "{!or2, not6, !impl1}, {!vara, !not11}, {vara, not11}, {varb, !and9}, {not11, !and9}, " +
                "{!varb, !not11, and9}, {!and9, or8}, {!varb, or8}, {and9, varb, !or8}, {impl1, !or8, !equiv0}, " +
                "{!impl1, or8, !equiv0}, {!impl1, !or8, equiv0}, {impl1, or8, equiv0}",
        )

    @Test
    fun testValid() {
        for ((f, e) in formulas) {
            val parsed = parser.parse(f)
            assertEquals(e, TseytinCNF.transform(parsed).toString())
        }
    }
}
