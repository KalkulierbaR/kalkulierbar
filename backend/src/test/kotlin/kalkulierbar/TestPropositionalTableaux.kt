package kalkulierbar

import kotlin.test.assertEquals
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

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

    @Test
    fun testInvalidStrings() {
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            instance.parseFormulaToState(invalidString1)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            instance.parseFormulaToState(invalidString2)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
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
            instance.parseFormulaToState(emptyString)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            instance.parseFormulaToState(edgeCase1)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            instance.parseFormulaToState(edgeCase2)
        }
        Assertions.assertThrows(InvalidFormulaFormat::class.java) {
            instance.parseFormulaToState(edgeCase3)
        }
    }
    /*
    // Test ApplyClose

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testUnknownMove() {
        var state = instance.parseFormulaToState("a,b,c;d")
        val hash = state.getHash()

        Assertions.assertThrows(InvalidMoveFormat::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"d\", \"id1\": 1, \"id2\": 0}")
        }

        Assertions.assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testApplyCloseValidA() {
        var state = instance.parseFormulaToState("a,b,c;!b")

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 0}")
        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 1}")
        state = instance.applyMoveOnState(state, "{\"type\":\"c\", \"id1\": 2, \"id2\": 1)")

        Assertions.assertEquals(true, state.nodes[1].isClosed)
        Assertions.assertEquals(true, state.nodes[2].isClosed)
        Assertions.assertEquals(2, state.nodes[1].closeRef)
        Assertions.assertEquals(1, state.nodes[2].closeRef)
        // Assertions.assertEquals("tableauxstate|{a, b, c}, {d}|[true;p;0;-;i;o;(1,2,3)|a;p;0;-;l;o;()|b;p;0;-;l;o;()|c;p;0;-;l;o;()]", state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testApplyCloseValidB() {
        var state = instance.parseFormulaToState("a,b,c;!a;!b;!c")

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 2}")
        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 0}")
        state = instance.applyMoveOnState(state, "{\"type\":\"c\", \"id1\": 3, \"id2\": 1)")

        Assertions.assertEquals(true, state.nodes[1].isClosed)
        Assertions.assertEquals(true, state.nodes[3].isClosed)

        Assertions.assertEquals(false, state.nodes[2].isClosed)
        Assertions.assertEquals(false, state.nodes[4].isClosed)

        Assertions.assertEquals(3, state.nodes[1].closeRef)
        Assertions.assertEquals(1, state.nodes[3].closeRef)
        // Assertions.assertEquals("tableauxstate|{a, b, c}, {d}|[true;p;0;-;i;o;(1)|d;p;0;-;l;o;()]", state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testApplyCloseValidC() {
        var state = instance.parseFormulaToState("a,b,c;!a;!b;!c")

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 0}")
        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 1}")
        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 2, \"id2\": 2}")

        state = instance.applyMoveOnState(state, "{\"type\":\"c\", \"id1\": 4, \"id2\": 1)")
        state = instance.applyMoveOnState(state, "{\"type\":\"c\", \"id1\": 5, \"id2\": 2)")

        Assertions.assertEquals(true, state.nodes[1].isClosed)
        Assertions.assertEquals(true, state.nodes[2].isClosed)
        Assertions.assertEquals(true, state.nodes[4].isClosed)
        Assertions.assertEquals(true, state.nodes[5].isClosed)

        Assertions.assertEquals(false, state.nodes[3].isClosed)

        Assertions.assertEquals(4, state.nodes[1].closeRef)
        Assertions.assertEquals(1, state.nodes[4].closeRef)
        Assertions.assertEquals(5, state.nodes[2].closeRef)
        Assertions.assertEquals(2, state.nodes[5].closeRef)
        // Assertions.assertEquals("tableauxstate|{a, b, c}, {d}|[true;p;0;-;i;o;(1,2,3)|a;p;0;-;l;o;()|b;p;0;-;l;o;()|c;p;0;-;i;o;(4)|d;p;3;-;l;o;()]", state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testCloseLeafIndexOOB() {
        var state = instance.parseFormulaToState("a,b;c")

        val hash = state.getHash()

        instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 0}")
        instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 0}")

        Assertions.assertThrows(InvalidMoveFormat::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"c\", \"id1\": 42, \"id2\": 1}")
        }

        Assertions.assertThrows(InvalidMoveFormat::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"c\", \"id1\": -15, \"id2\": 1}")
        }

        Assertions.assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testCloseIndexOOB() {
        var state = instance.parseFormulaToState("a,b;c")

        val hash = state.getHash()

        instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 0}")
        instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 0}")

        Assertions.assertThrows(InvalidMoveFormat::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"c\", \"id1\": 3, \"id2\": 403}")
        }

        Assertions.assertThrows(InvalidMoveFormat::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"c\", \"id1\": 4, \"id2\": -3}")
        }

        Assertions.assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testCloseOnNonLeaf() {
        var state = instance.parseFormulaToState("a,b;c")

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 1}")
        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 1}")

        val hash = state.getHash()

        Assertions.assertThrows(InvalidMoveFormat::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"c\", \"id1\": 1, \"id2\": 2}")
        }

        Assertions.assertThrows(InvalidMoveFormat::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 2, \"id2\": 1}")
        }

        Assertions.assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testCloseWithNonPath() {
        var state = instance.parseFormulaToState("a,b;!b")

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 0}")
        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 0}")
        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 2, \"id2\": 1}")
        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 5, \"id2\": 0}")

        val hash = state.getHash()

        Assertions.assertThrows(InvalidMoveFormat::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"c\", \"id1\": 4, \"id2\": 5}")
        }

        Assertions.assertThrows(InvalidMoveFormat::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 5, \"id2\": 4}")
        }

        Assertions.assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testCloseNullValues() {
        var state = instance.parseFormulaToState("a,b;c")

        val hash = state.getHash()

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 0}")
        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 2}")

        Assertions.assertThrows(JsonParseException::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"c\", \"id1\": null, \"id2\": 1}")
        }

        Assertions.assertThrows(JsonParseException::class.java) {
            instance.applyMoveOnState(state, "{\"type\":null, \"id1\": 3, \"id2\": 2}")
        }

        Assertions.assertThrows(JsonParseException::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"c\", \"id1\": 3, \"id2\": null}")
        }

        Assertions.assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }
    */
}
