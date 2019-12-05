
package kalkulierbar.tests

import kalkulierbar.IllegalMove
import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.JsonParseException
import kalkulierbar.PropositionalTableaux
import kalkulierbar.TableauxMove
import kalkulierbar.TableauxNode
import kalkulierbar.TableauxState
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
        Test parseFormulaToState
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
    fun testUnknownMove() {
        val state = instance.parseFormulaToState("a,b,c;d")
        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("d", 1, 0))
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    fun testApplyMoveNullValues() {
        val state = instance.parseFormula("a,b;c")

        assertFailsWith<JsonParseException> {
            instance.applyMove(state, "{\"type\":\"e\", \"id1\": null, \"id2\": 2}")
        }

        assertFailsWith<JsonParseException> {
            instance.applyMove(state, "{\"type\":null, \"id1\": 0, \"id2\": -3}")
        }

        assertFailsWith<JsonParseException> {
            instance.applyMove(state, "{\"type\":null, \"id1\": 0, \"id2\": null}")
        }
    }

    @Test
    fun testExpandValidA() {
        var state = instance.parseFormulaToState("a,b,c;d")

        state = instance.applyMoveOnState(state, TableauxMove("e", 0, 0))

        assertEquals(4, state.nodes.size)
        assertEquals(3, state.nodes.get(0).children.size)

        assertEquals("tableauxstate|{a, b, c}, {d}|[true;p;null;-;i;o;(1,2,3)|a;p;0;-;l;o;()|b;p;0;-;l;o;()|c;p;0;-;l;o;()]", state.getHash())
    }

    @Test
    fun testExpandValidB() {
        var state = instance.parseFormulaToState("a,b,c;d")

        state = instance.applyMoveOnState(state, TableauxMove("e", 0, 1))

        assertEquals(2, state.nodes.size)
        assertEquals(1, state.nodes.get(0).children.size)

        assertEquals("tableauxstate|{a, b, c}, {d}|[true;p;null;-;i;o;(1)|d;p;0;-;l;o;()]", state.getHash())
    }

    @Test
    fun testExpandValidC() {
        var state = instance.parseFormulaToState("a,b,c;d")

        state = instance.applyMoveOnState(state, TableauxMove("e", 0, 0))
        state = instance.applyMoveOnState(state, TableauxMove("e", 3, 1))

        assertEquals(5, state.nodes.size)
        assertEquals(3, state.nodes.get(0).children.size)
        assertEquals(1, state.nodes.get(3).children.size)

        assertEquals("tableauxstate|{a, b, c}, {d}|[true;p;null;-;i;o;(1,2,3)|a;p;0;-;l;o;()|b;p;0;-;l;o;()|c;p;0;-;i;o;(4)|d;p;3;-;l;o;()]", state.getHash())
    }

    @Test
    fun testExpandLeafIndexOOB() {
        val state = instance.parseFormulaToState("a,b;c")

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("e", 1, 0))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("e", -15, 0))
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    fun testExpandClauseIndexOOB() {
        val state = instance.parseFormulaToState("a,b;c")

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("e", 0, 2))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("e", 0, -3))
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    fun testExpandOnNonLeaf() {
        var state = instance.parseFormulaToState("a,b;c")

        state = instance.applyMoveOnState(state, TableauxMove("e", 0, 1))
        state = instance.applyMoveOnState(state, TableauxMove("e", 1, 1))

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("e", 0, 0))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("e", 1, 0))
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    fun testExpandClosedLeaf() {
        var state = instance.parseFormulaToState("a;!a")

        state = instance.applyMoveOnState(state, TableauxMove("e", 0, 0))
        state = instance.applyMoveOnState(state, TableauxMove("e", 1, 1))

        val leaf = state.nodes.get(2)
        leaf.isClosed = true
        leaf.closeRef = 1

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("e", 2, 0))
        }
    }

    // ApplyCose state creation helper function
    private fun createArtificialExpandState(nodes: List<TableauxNode>, state: TableauxState): TableauxState {
        state.nodes.addAll(nodes)

        for (i in nodes.indices) {
            val parentThisNode = nodes[i].parent
            state.nodes[parentThisNode!!].children.add(i + 1)
        }
        return state
    }

    @Test
    fun testApplyCloseValidA() {
        var state = instance.parseFormulaToState("a,b;!b")

        val nodes = listOf(
                TableauxNode(0, "a", false),
                TableauxNode(0, "b", false),
                TableauxNode(2, "b", true)
        )
        state = createArtificialExpandState(nodes, state)
        state = instance.applyMoveOnState(state, TableauxMove("c", 3, 2))

        assertEquals(true, state.nodes[3].isClosed)
        assertEquals(2, state.nodes[3].closeRef)
        assertEquals("tableauxstate|{a, b}, {!b}|[true;p;null;-;i;o;(1,2)|a;p;0;-;l;o;()|b;p;0;-;i;o;(3)|b;n;2;2;l;c;()]", state.getHash())
    }

    @Test
    fun testApplyCloseValidB() {
        var state = instance.parseFormulaToState("a,b,c;!a;!b;!c")

        val nodes = listOf(
                TableauxNode(0, "b", true),
                TableauxNode(1, "a", false),
                TableauxNode(1, "b", false),
                TableauxNode(1, "c", false)
        )
        state = createArtificialExpandState(nodes, state)
        state = instance.applyMoveOnState(state, TableauxMove("c", 3, 1))

        assertEquals(true, state.nodes[3].isClosed)

        assertEquals(false, state.nodes[2].isClosed)
        assertEquals(false, state.nodes[4].isClosed)

        assertEquals(1, state.nodes[3].closeRef)
        assertEquals("tableauxstate|{a, b, c}, {!a}, {!b}, {!c}|[true;p;null;-;i;o;(1)|b;n;0;-;i;o;(2,3,4)|a;p;1;-;l;o;()|b;p;1;1;l;c;()|c;p;1;-;l;o;()]", state.getHash())
    }

    @Test
    fun testApplyCloseValidC() {
        var state = instance.parseFormulaToState("a,b,c;!a;!b;!c")

        val nodes = listOf(
                TableauxNode(0, "a", false),
                TableauxNode(0, "b", false),
                TableauxNode(0, "c", false),
                TableauxNode(1, "a", true),
                TableauxNode(2, "b", true)
        )
        state = createArtificialExpandState(nodes, state)

        state = instance.applyMoveOnState(state, TableauxMove("c", 4, 1))
        state = instance.applyMoveOnState(state, TableauxMove("c", 5, 2))

        assertEquals(true, state.nodes[4].isClosed)
        assertEquals(true, state.nodes[5].isClosed)

        assertEquals(false, state.nodes[3].isClosed)

        assertEquals(1, state.nodes[4].closeRef)
        assertEquals(2, state.nodes[5].closeRef)
        assertEquals("tableauxstate|{a, b, c}, {!a}, {!b}, {!c}|[true;p;null;-;i;o;(1,2,3)|a;p;0;-;i;o;(4)|b;p;0;-;i;o;(5)|c;p;0;-;l;o;()|a;n;1;1;l;c;()|b;n;2;2;l;c;()]", state.getHash())
    }

    @Test
    fun testCloseLeafIndexOOB() {
        val state = instance.parseFormulaToState("a,b;c")

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("c", 42, 1))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("c", -15, 1))
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    fun testCloseIndexOOB() {
        var state = instance.parseFormulaToState("a,b;c")

        val nodes = listOf(
                TableauxNode(0, "a", false),
                TableauxNode(0, "b", false),
                TableauxNode(1, "a", false),
                TableauxNode(1, "b", false)
        )
        state = createArtificialExpandState(nodes, state)

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("c", 3, 403))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("c", 4, -3))
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    fun testCloseOnNonLeaf() {
        var state = instance.parseFormulaToState("a,b;c")

        val nodes = listOf(
                TableauxNode(0, "c", false),
                TableauxNode(1, "c", false)
        )
        state = createArtificialExpandState(nodes, state)

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("c", 1, 2))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("c", 2, 1))
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    fun testCloseWithNonPath() {
        var state = instance.parseFormulaToState("a,b;!b")

        val nodes = listOf(
                TableauxNode(0, "a", false),
                TableauxNode(0, "b", false),
                TableauxNode(1, "a", false),
                TableauxNode(1, "b", false),
                TableauxNode(2, "b", true),
                TableauxNode(5, "a", false),
                TableauxNode(5, "b", false)
        )
        state = createArtificialExpandState(nodes, state)

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("c", 4, 5))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("c", 5, 4))
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    /*
        Test checkCloseOnState
    */

    @Test
    fun testCheckCloseSimple() {
        val state = instance.parseFormulaToState("a,!a")

        assertEquals("false", instance.checkCloseOnState(state))

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(1, "a", true)
            )

        state.nodes.addAll(nodes)
        state.nodes.get(0).children.add(1)
        state.nodes.get(1).children.add(2)

        assertEquals("false", instance.checkCloseOnState(state))

        // Now close the proof
        val a = state.nodes.get(2)

        a.closeRef = 1
        a.isClosed = true

        assertEquals("true", instance.checkCloseOnState(state))
    }

    @Test
    fun testCheckClose() {
        val state = instance.parseFormulaToState("a,b;!a,!b")

        assertEquals("false", instance.checkCloseOnState(state))

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

        assertEquals("false", instance.checkCloseOnState(state))

        // Now close the proof
        val a = state.nodes.get(3)
        val b = state.nodes.get(4)

        a.closeRef = 1
        b.closeRef = 2
        a.isClosed = true
        b.isClosed = true

        assertEquals("true", instance.checkCloseOnState(state))
    }

    @Test
    fun testCheckCloseIncorrectState() {
        val state = instance.parseFormulaToState("a,b;!a,!b")

        state.nodes.add(TableauxNode(0, "a", true))
        state.nodes.get(0).children.add(1)

        assertEquals("false", instance.checkCloseOnState(state))

        // Just mark the leaf as closed without doing anything
        state.nodes.get(1).isClosed = true

        assertEquals("false", instance.checkCloseOnState(state))

        // Set a closeRef, too
        state.nodes.get(1).closeRef = 0

        assertEquals("false", instance.checkCloseOnState(state))

        // Set the closeRef to itself
        state.nodes.get(1).closeRef = 1

        assertEquals("false", instance.checkCloseOnState(state))
    }

    @Test
    fun testCheckCloseIncorrectState2() {
        val state = instance.parseFormulaToState("a,!a")

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(1, "a", true)
            )

        state.nodes.addAll(nodes)
        state.nodes.get(0).children.add(1)
        state.nodes.get(1).children.add(2)

        // Don't close proof completely
        state.nodes.get(2).closeRef = 1

        assertEquals("false", instance.checkCloseOnState(state))
    }
}
