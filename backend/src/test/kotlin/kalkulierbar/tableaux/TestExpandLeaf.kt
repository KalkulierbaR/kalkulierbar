package kalkulierbar.tests.tableaux

import kalkulierbar.IllegalMove
import kalkulierbar.JsonParseException
import kalkulierbar.tableaux.PropositionalTableaux
import kalkulierbar.tableaux.TableauxMove
import kalkulierbar.tableaux.TableauxParam
import kalkulierbar.tableaux.TableauxType
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestExpandLeaf {

    val instance = PropositionalTableaux()
    val opts = TableauxParam(TableauxType.UNCONNECTED, false)

    @Test
    fun testUnknownMove() {
        val state = instance.parseFormulaToState("a,b,c;d", opts)
        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("d", 1, 0))
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    fun testApplyMoveNullValues() {
        val state = instance.parseFormula("a,b;c", "{\"type\":\"UNCONNECTED\",\"regular\":false}")

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
        var state = instance.parseFormulaToState("a,b,c;d", opts)

        state = instance.applyMoveOnState(state, TableauxMove("e", 0, 0))

        assertEquals(4, state.nodes.size)
        assertEquals(3, state.nodes.get(0).children.size)

        assertEquals("tableauxstate|UNCONNECTED|false|{a, b, c}, {d}|[true;p;null;-;i;o;(1,2,3)|a;p;0;-;l;o;()|b;p;0;-;l;o;()|c;p;0;-;l;o;()]", state.getHash())
    }

    @Test
    fun testExpandValidB() {
        var state = instance.parseFormulaToState("a,b,c;d", opts)

        state = instance.applyMoveOnState(state, TableauxMove("e", 0, 1))

        assertEquals(2, state.nodes.size)
        assertEquals(1, state.nodes.get(0).children.size)

        assertEquals("tableauxstate|UNCONNECTED|false|{a, b, c}, {d}|[true;p;null;-;i;o;(1)|d;p;0;-;l;o;()]", state.getHash())
    }

    @Test
    fun testExpandValidC() {
        var state = instance.parseFormulaToState("a,b,c;d", opts)

        state = instance.applyMoveOnState(state, TableauxMove("e", 0, 0))
        state = instance.applyMoveOnState(state, TableauxMove("e", 3, 1))

        assertEquals(5, state.nodes.size)
        assertEquals(3, state.nodes.get(0).children.size)
        assertEquals(1, state.nodes.get(3).children.size)

        assertEquals("tableauxstate|UNCONNECTED|false|{a, b, c}, {d}|[true;p;null;-;i;o;(1,2,3)|a;p;0;-;l;o;()|b;p;0;-;l;o;()|c;p;0;-;i;o;(4)|d;p;3;-;l;o;()]", state.getHash())
    }

    @Test
    fun testExpandLeafIndexOOB() {
        val state = instance.parseFormulaToState("a,b;c", opts)

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
        val state = instance.parseFormulaToState("a,b;c", opts)

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
        var state = instance.parseFormulaToState("a,b;c", opts)

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
        var state = instance.parseFormulaToState("a;!a", opts)

        state = instance.applyMoveOnState(state, TableauxMove("e", 0, 0))
        state = instance.applyMoveOnState(state, TableauxMove("e", 1, 1))

        val leaf = state.nodes.get(2)
        leaf.isClosed = true
        leaf.closeRef = 1

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, TableauxMove("e", 2, 0))
        }
    }
}
