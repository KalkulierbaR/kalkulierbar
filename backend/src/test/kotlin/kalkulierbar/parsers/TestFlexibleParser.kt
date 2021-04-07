package kalkulierbar.tests.parsers

import kalkulierbar.FormulaConversionException
import kalkulierbar.parsers.CnfStrategy
import kalkulierbar.parsers.FlexibleClauseSetParser
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class TestFlexibleParser {

    private val blowup = """(x1 & y1) | (x2 & y2) | (x3 & y3) | (x4 & y4) | (x5 & y5) | (x6 & y6) | (x7 & y7) |
					(x8 & y8) | (x9 & y9) | (xa & ya) | (xb & yb) | (xc & yc) | (xd & yd) | (xe & ye) |
					(xf & yf) | (xg & yg) | (xh & yh) | (xi & yi) | (xj & yj) | (xk & yk) | (xl & yl)"""

    private val blowupSm = "(x1 & y1) | (x2 & y2) | (x3 & y3) | (x4 & y4) | (x5 & y5) | (x6 & y6) | (x7 & y7)"

    @Test
    fun testNaiveCNFBlowup() {
        assertFailsWith<FormulaConversionException> {
            FlexibleClauseSetParser.parse(blowup, CnfStrategy.NAIVE)
        }
    }

    @Test
    fun testOptimalCNFBlowup() {
        val parsed = FlexibleClauseSetParser.parse(blowup, CnfStrategy.OPTIMAL)
        assertTrue(parsed.clauses.size < 200)
    }

    @Test
    fun testOptimalSwitchoverA() {
        val parsedOpt = FlexibleClauseSetParser.parse(blowupSm, CnfStrategy.OPTIMAL)
        val parsedTseytin = FlexibleClauseSetParser.parse(blowupSm, CnfStrategy.TSEYTIN)
        assertEquals(parsedTseytin.toString(), parsedOpt.toString())
    }

    @Test
    fun testOptimalSwitchoverB() {
        val parsedOpt = FlexibleClauseSetParser.parse("x & !y", CnfStrategy.OPTIMAL)
        val parsedNaive = FlexibleClauseSetParser.parse("x & !y", CnfStrategy.NAIVE)
        assertEquals(parsedNaive.toString(), parsedOpt.toString())
    }
}
