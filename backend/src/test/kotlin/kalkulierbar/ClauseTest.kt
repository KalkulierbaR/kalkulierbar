package kalkulierbar

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

/**
 * ClauseAcceptor Test Class
 */
class ClauseTest {
    val acceptor = ClauseAcceptor()

    val invalidString = "a,b;c,!d;e,&;g,h,i,!j"
    val validString = "!a,b;c,!d;e,f,g,!h;i,j,!k,l,!m;n;o;p"

    @Test
    fun testAssertion() {
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            acceptor.parseFormula(invalidString)
        }
    }

    @Test
    fun testValidString() {
        val returnedValidString = acceptor.parseFormula(validString)
        Assertions.assertEquals(returnedValidString, "")
    }
}
