package kalkulierbar

import kotlin.test.assertEquals
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

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
    fun testParseValidString() {
        val state1 = instance.parseFormulaToState(validString1)
        val state2 = instance.parseFormulaToState(validString2)
        val state3 = instance.parseFormulaToState(validString3)

        val root1 = state1.nodes[0]
        val root2 = state2.nodes[0]
        val root3 = state3.nodes[0]

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
    fun testParseEdgeCases() {
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
        Test applyMoveOnState
    */

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testUnknownMove() {
        var state = instance.parseFormulaToState("a,b,c;d")
        val hash = state.getHash()

        Assertions.assertThrows(IllegalMove::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"d\", \"id1\": 1, \"id2\": 0}")
        }

        Assertions.assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandValidA() {
        var state = instance.parseFormulaToState("a,b,c;d")

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 0}")

        Assertions.assertEquals(4, state.nodes.size)
        Assertions.assertEquals(3, state.nodes.get(0).children.size)
        Assertions.assertEquals("tableauxstate|{a, b, c}, {d}|[true;p;0;-;i;o;(1,2,3)|a;p;0;-;l;o;()|b;p;0;-;l;o;()|c;p;0;-;l;o;()]", state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandValidB() {
        var state = instance.parseFormulaToState("a,b,c;d")

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 1}")

        Assertions.assertEquals(2, state.nodes.size)
        Assertions.assertEquals(1, state.nodes.get(0).children.size)
        Assertions.assertEquals("tableauxstate|{a, b, c}, {d}|[true;p;0;-;i;o;(1)|d;p;0;-;l;o;()]", state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandValidC() {
        var state = instance.parseFormulaToState("a,b,c;d")

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 0}")
        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 3, \"id2\": 1}")

        Assertions.assertEquals(5, state.nodes.size)
        Assertions.assertEquals(3, state.nodes.get(0).children.size)
        Assertions.assertEquals(1, state.nodes.get(3).children.size)
        Assertions.assertEquals("tableauxstate|{a, b, c}, {d}|[true;p;0;-;i;o;(1,2,3)|a;p;0;-;l;o;()|b;p;0;-;l;o;()|c;p;0;-;i;o;(4)|d;p;3;-;l;o;()]", state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandLeafIndexOOB() {
        var state = instance.parseFormulaToState("a,b;c")

        val hash = state.getHash()

        Assertions.assertThrows(IllegalMove::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 0}")
        }

        Assertions.assertThrows(IllegalMove::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": -15, \"id2\": 0}")
        }

        Assertions.assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandClauseIndexOOB() {
        var state = instance.parseFormulaToState("a,b;c")

        val hash = state.getHash()

        Assertions.assertThrows(IllegalMove::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 2}")
        }

        Assertions.assertThrows(IllegalMove::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": -3}")
        }

        Assertions.assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandOnNonLeaf() {
        var state = instance.parseFormulaToState("a,b;c")

        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 1}")
        state = instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 1}")

        val hash = state.getHash()

        Assertions.assertThrows(IllegalMove::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 0, \"id2\": 0}")
        }

        Assertions.assertThrows(IllegalMove::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": 1, \"id2\": 0}")
        }

        Assertions.assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testExpandNullValues() {
        var state = instance.parseFormulaToState("a,b;c")

        val hash = state.getHash()

        Assertions.assertThrows(JsonParseException::class.java) {
            instance.applyMoveOnState(state, "{\"type\":\"e\", \"id1\": null, \"id2\": 2}")
        }

        Assertions.assertThrows(JsonParseException::class.java) {
            instance.applyMoveOnState(state, "{\"type\":null, \"id1\": 0, \"id2\": -3}")
        }

        Assertions.assertThrows(JsonParseException::class.java) {
            instance.applyMoveOnState(state, "{\"type\":null, \"id1\": 0, \"id2\": null}")
        }

        Assertions.assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }
}
