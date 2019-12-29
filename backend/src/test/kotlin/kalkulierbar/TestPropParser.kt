package kalkulierbar

import kalkulierbar.parsers.PropositionalParser
import kotlin.test.Test
import kotlin.test.assertFailsWith


class TestPropParser {
    private val parser = PropositionalParser()

    private val invalid = listOf("", "-->a", "<--", "--><=>", "!->", "a!", "a-->", "b<=>")

    @Test
    fun testValidStrings() {
        for(s in invalid) {
            assertFailsWith<InvalidFormulaFormat> {
                println(s)
                parser.parse(s)
            }
        }
    }
}