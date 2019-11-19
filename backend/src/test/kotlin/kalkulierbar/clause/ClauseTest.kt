package kalkulierbar.clause

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import kalkulierbar.*

/**
 * ClauseAcceptor Test Class
 */
class ClauseTest {
    val acceptor = ClauseAcceptor()

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
            acceptor.parseFormula(invalidString1)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            acceptor.parseFormula(invalidString2)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            acceptor.parseFormula(invalidString3)
        }
    }

    @Test
    fun testValidString() {
        val returnedValidString1 = acceptor.parseFormula(validString1)
        val returnedValidString2 = acceptor.parseFormula(validString2)
        val returnedValidString3 = acceptor.parseFormula(validString3)

        Assertions.assertEquals(returnedValidString1, "[[(l, true), (j, true), (i, true), (m, false), (k, false)], [(o, true)], [(a, false), (b, true)], [(n, true)], [(g, true), (f, true), (e, true), (h, false)], [(d, false), (c, true)], [(p, true)]]")
        Assertions.assertEquals(returnedValidString2, "[[(was, true), (geht, false), (hey, true)], [(bin, true), (ich, false), (richtig, true)]]")
        Assertions.assertEquals(returnedValidString3, "[[(ch, false)], [(ei, true)], [(t, true)], [(vi, true)], [(ja, false)], [(ell, false)]]")
    }

    @Test
    fun testEdgeCases() {
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            acceptor.parseFormula(emptyString)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            acceptor.parseFormula(edgeCase1)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            acceptor.parseFormula(edgeCase2)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            acceptor.parseFormula(edgeCase3)
        }
    }
}