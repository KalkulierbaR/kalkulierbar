package kalkulierbar.tableaux

import kalkulierbar.InvalidFormulaFormat
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestParseFormulaState {
    val instance = PropositionalTableaux()
    private val opts = TableauxParam(TableauxType.UNCONNECTED, false, false)

    private val invalidString1 = "a,b;c,!d;e,&;g,h,i,!j"
    private val invalidString2 = "richtig;\noder,!falsch"
    private val invalidString3 = "mal,am,Ende!"

    private val validString1 = "!a,b;c,!d;e,f,g,!h;i,j,!k,l,!m;n;o;p"
    private val validString2 = "hey,was,!geht;bin,!ich,richtig"
    private val validString3 = "!ja;vi;!ell;ei;!ch;t"

    private val emptyString = ""

    private val edgeCase1 = "ein,!im;Wo!rt"
    private val edgeCase2 = "kein,valName,!"
    private val edgeCase3 = "doppelter;Semikolon;;hello"

    @Test
    fun testParseInvalidStrings() {
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(invalidString1, opts)
        }
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(invalidString2, opts)
        }
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(invalidString3, opts)
        }
    }

    @Test
    fun testParseValidString() {
        val state1 = instance.parseFormulaToState(validString1, opts)
        val state2 = instance.parseFormulaToState(validString2, opts)
        val state3 = instance.parseFormulaToState(validString3, opts)

        val root1 = state1.tree[0]
        val root2 = state2.tree[0]
        val root3 = state3.tree[0]

        assertEquals(state1.tree.size, 1)
        assertEquals(root1.parent, null)
        assertEquals(root1.spelling, "true")
        assertEquals(root1.negated, false)

        assertEquals(state2.tree.size, 1)
        assertEquals(root2.parent, null)
        assertEquals(root2.spelling, "true")
        assertEquals(root2.negated, false)

        assertEquals(state3.tree.size, 1)
        assertEquals(root3.parent, null)
        assertEquals(root3.spelling, "true")
        assertEquals(root3.negated, false)
    }

    @Test
    fun testParseEdgeCases() {
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(emptyString, opts)
        }
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(edgeCase1, opts)
        }
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(edgeCase2, opts)
        }
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(edgeCase3, opts)
        }
    }

    @Test
    fun testParseDefaultParams() {
        val state = instance.parseFormulaToState("a;b", null)
        assertEquals(TableauxType.UNCONNECTED, state.type)
        assertEquals(false, state.regular)
    }
}
