package kalkulierbar.tests

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.PropositionalTableaux
import kalkulierbar.TableauxNode
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestPropositionalTableaux {

    var instance = PropositionalTableaux()

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

    /*
     * Test parseFormulaToState
     */

    @Test
    fun testInvalidStrings() {
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(invalidString1)
        }
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(invalidString2)
        }
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(invalidString3)
        }
    }

    @Test
    fun testValidString() {
        val state1 = instance.parseFormulaToState(validString1)
        val state2 = instance.parseFormulaToState(validString2)
        val state3 = instance.parseFormulaToState(validString3)

        var root1 = state1.nodes[0]
        var root2 = state2.nodes[0]
        var root3 = state3.nodes[0]

        assertEquals(state1.nodes.size, 1)
        assertEquals(root1.parent, null)
        assertEquals(root1.spelling, "true")
        assertEquals(root1.negated, false)

        assertEquals(state2.nodes.size, 1)
        assertEquals(root2.parent, null)
        assertEquals(root2.spelling, "true")
        assertEquals(root2.negated, false)

        assertEquals(state3.nodes.size, 1)
        assertEquals(root3.parent, null)
        assertEquals(root3.spelling, "true")
        assertEquals(root3.negated, false)
    }

    @Test
    fun testEdgeCases() {
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(emptyString)
        }
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(edgeCase1)
        }
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(edgeCase2)
        }
        assertFailsWith<InvalidFormulaFormat> {
            instance.parseFormulaToState(edgeCase3)
        }
    }

    /*
     * Test checkCloseOnState
     */

    @Test
    fun testCheckCloseSimple() {
        var state = instance.parseFormulaToState("a,!a")

        assertEquals(false, instance.checkCloseOnState(state))

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(1, "a", true)
            )

        state.nodes.addAll(nodes)
        state.nodes.get(0).children.add(1)
        state.nodes.get(1).children.add(2)

        assertEquals(false, instance.checkCloseOnState(state))

        // Now close the proof
        val a = state.nodes.get(2)

        a.closeRef = 1
        a.isClosed = true

        assertEquals(true, instance.checkCloseOnState(state))
    }

    @Test
    fun testCheckClose() {
        var state = instance.parseFormulaToState("a,b;!a,!b")

        assertEquals(false, instance.checkCloseOnState(state))

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(0, "b", false),
            TableauxNode(1, "a", true),
            TableauxNode(2, "b", true)
            )

        state.nodes.addAll(nodes)
        state.nodes.get(0).children.add(1)
        state.nodes.get(0).children.add(2)
        state.nodes.get(1).children.add(3)
        state.nodes.get(2).children.add(4)

        assertEquals(false, instance.checkCloseOnState(state))

        // Now close the proof
        val a = state.nodes.get(3)
        val b = state.nodes.get(4)

        a.closeRef = 1
        b.closeRef = 2
        a.isClosed = true
        b.isClosed = true

        assertEquals(true, instance.checkCloseOnState(state))
    }

    @Test
    fun testCheckCloseIncorrectState() {
        var state = instance.parseFormulaToState("a,b;!a,!b")

        state.nodes.add(TableauxNode(0, "a", true))
        state.nodes.get(0).children.add(1)

        assertEquals(false, instance.checkCloseOnState(state))

        // Just mark the leaf as closed without doing anything
        state.nodes.get(1).isClosed = true

        assertEquals(false, instance.checkCloseOnState(state))

        // Set a closeRef, too
        state.nodes.get(1).closeRef = 0

        assertEquals(false, instance.checkCloseOnState(state))

        // Set the closeRef to itself
        state.nodes.get(1).closeRef = 1

        assertEquals(false, instance.checkCloseOnState(state))
    }

    @Test
    fun testCheckCloseIncorrectState2() {
        var state = instance.parseFormulaToState("a,!a")

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(1, "a", true)
            )

        state.nodes.addAll(nodes)
        state.nodes.get(0).children.add(1)
        state.nodes.get(1).children.add(2)

        // Don't close proof completely
        state.nodes.get(2).closeRef = 1

        assertEquals(false, instance.checkCloseOnState(state))
    }
}
