package kalkulierbar.tests

import kalkulierbar.IllegalMove
import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.JsonParseException
import kalkulierbar.PropositionalTableaux
import kalkulierbar.TableauxNode
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestPropositionalTableaux {

    val instance = PropositionalTableaux()

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
    fun testParseInvalidStrings() {
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
    fun testParseValidString() {
        val state1 = instance.parseFormulaToState(validString1)
        val state2 = instance.parseFormulaToState(validString2)
        val state3 = instance.parseFormulaToState(validString3)

        val root1 = state1.nodes[0]
        val root2 = state2.nodes[0]
        val root3 = state3.nodes[0]

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
    fun testParseEdgeCases() {
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
        Test applyMoveOnState
    */

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testUnknownMove() {
        var state = instance.parseFormulaToState("a,b,c;d")
        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, "{\"type\":\"d\", \"id1\": 1, \"id2\": 0}")
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandValidA() {
        var state = instance.parseFormulaToState("a,b,c;d")

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 0}")

        assertEquals(4, state.nodes.size)
        assertEquals(3, state.nodes.get(0).children.size)
        assertEquals("tableauxstate|{a, b, c}, {d}|[true;p;null;-;i;o;(1,2,3)|a;p;0;-;l;o;()|b;p;0;-;l;o;()|c;p;0;-;l;o;()]", state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandValidB() {
        var state = instance.parseFormulaToState("a,b,c;d")

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 1}")

        assertEquals(2, state.nodes.size)
        assertEquals(1, state.nodes.get(0).children.size)
        assertEquals("tableauxstate|{a, b, c}, {d}|[true;p;null;-;i;o;(1)|d;p;0;-;l;o;()]", state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandValidC() {
        var state = instance.parseFormulaToState("a,b,c;d")

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 0}")
        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 3, \"id2\": 1}")

        assertEquals(5, state.nodes.size)
        assertEquals(3, state.nodes.get(0).children.size)
        assertEquals(1, state.nodes.get(3).children.size)
        assertEquals("tableauxstate|{a, b, c}, {d}|[true;p;null;-;i;o;(1,2,3)|a;p;0;-;l;o;()|b;p;0;-;l;o;()|c;p;0;-;i;o;(4)|d;p;3;-;l;o;()]", state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandLeafIndexOOB() {
        var state = instance.parseFormulaToState("a,b;c")

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 0}")
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": -15, \"id2\": 0}")
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandClauseIndexOOB() {
        var state = instance.parseFormulaToState("a,b;c")

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 2}")
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": -3}")
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandOnNonLeaf() {
        var state = instance.parseFormulaToState("a,b;c")

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 1}")
        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 1}")

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 0}")
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 0}")
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandNullValues() {
        var state = instance.parseFormulaToState("a,b;c")

        val hash = state.getHash()

        assertFailsWith<JsonParseException> {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": null, \"id2\": 2}")
        }

        assertFailsWith<JsonParseException> {
            instance.applyMoveOnState(state, "{\"type\":null, \"id1\": 0, \"id2\": -3}")
        }

        assertFailsWith<JsonParseException> {
            instance.applyMoveOnState(state, "{\"type\":null, \"id1\": 0, \"id2\": null}")
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
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
