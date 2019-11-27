package kalkulierbar

import kotlin.test.assertEquals
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class TestPropositionalTableaux {

    var parser = PropositionalTableaux()

    val invalidString1 = "a,b;c,!d;e,&;g,h,i,!j"
    val invalidString2 = "richtig; oder,!falsch"
    val invalidString3 = "mal,am,Ende "

    val validString1 = "!a,b;c,!d;e,f,g,!h;i,j,!k,l,!m;n;o;p"
    val validString2 = "hey,was,!geht;bin,!ich,richtig"
    val validString3 = "!ja;vi;!ell;ei;!ch;t"

    val emptyString = ""

    val edgeCase1 = "ein,!im;Wo!rt"
    val edgeCase2 = "kein,valName,!"
    val edgeCase3 = "doppelter;Semikolon;;hello"

    @Test
    fun testInvalidStrings() {
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            parser.parseFormulaToState(invalidString1)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            parser.parseFormulaToState(invalidString2)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            parser.parseFormulaToState(invalidString3)
        }
    }

    @Test
    fun testValidString() {
        val state1 = parser.parseFormulaToState(validString1)
        val state2 = parser.parseFormulaToState(validString2)
        val state3 = parser.parseFormulaToState(validString3)

        var root1 = state1.nodes[0]
        var root2 = state2.nodes[0]
        var root3 = state3.nodes[0]

        assertEquals(state1.nodes.size, 1)
        assertEquals(root1.parent, 0)
        assertEquals(root1.spelling, "true")
        assertEquals(root1.negated, false)

        assertEquals(state2.nodes.size, 1)
        assertEquals(root2.parent, 0)
        assertEquals(root2.spelling, "true")
        assertEquals(root2.negated, false)

        assertEquals(state3.nodes.size, 1)
        assertEquals(root3.parent, 0)
        assertEquals(root3.spelling, "true")
        assertEquals(root3.negated, false)
    }

    @Test
    fun testEdgeCases() {
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            parser.parseFormulaToState(emptyString)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            parser.parseFormulaToState(edgeCase1)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            parser.parseFormulaToState(edgeCase2)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            parser.parseFormulaToState(edgeCase3)
        }
    }
}
