package kalkulierbar.tests.tableaux

import kalkulierbar.IllegalMove
import kalkulierbar.tableaux.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class TestConnectedness {

    val instance = PropositionalTableaux()
    val optsWeak = TableauxParam(TableauxType.WEAKLYCONNECTED, regular = false, backtracking = false)
    val optsStrong = TableauxParam(TableauxType.STRONGLYCONNECTED, regular = false, backtracking = false)

    @Test
    fun testConnectednessValidA() {
        var state = instance.parseFormulaToState("a,b,c;!a,b", optsWeak)

        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        state = instance.applyMoveOnState(state, MoveAutoClose(4, 1))
        state = instance.applyMoveOnState(state, MoveExpand(5, 1))
        state = instance.applyMoveOnState(state, MoveAutoClose(6, 1))

        val isConnected = checkConnectedness(state, TableauxType.WEAKLYCONNECTED)
        assertTrue(isConnected)

        assertEquals(
            "tableauxstate|WEAKLYCONNECTED|false|false|false|{a, b, c}, {!a, b}|" +
                "[true;p;null;-;i;o;(1,2,3)|a;p;0;-;i;o;(4,5)|b;p;0;-;l;o;()|c;p;0;-;l;o;()|a;n;1;1;l;c;()|" +
                "b;p;1;-;i;o;(6,7)|a;n;5;1;l;c;()|b;p;5;-;l;o;()]|[]",
            state.getHash()
        )
    }

    @Test
    fun testConnectednessValidB() {
        var state = instance.parseFormulaToState("!a,b;a", optsWeak)

        state = instance.applyMoveOnState(state, MoveExpand(0, 1))
        state = instance.applyMoveOnState(state, MoveExpand(1, 0))
        state = instance.applyMoveOnState(state, MoveAutoClose(2, 1))
        state = instance.applyMoveOnState(state, MoveExpand(3, 0))
        state = instance.applyMoveOnState(state, MoveAutoClose(4, 1))

        val isConnected = checkConnectedness(state, TableauxType.WEAKLYCONNECTED)
        assertTrue(isConnected)
        println(state.getHash())
        assertEquals(
            "tableauxstate|WEAKLYCONNECTED|false|false|false|{!a, b}, {a}|[true;p;null;-;i;o;(1)|" +
                "a;p;0;-;i;o;(2,3)|a;n;1;1;l;c;()|b;p;1;-;i;o;(4,5)|a;n;3;1;l;c;()|b;p;3;-;l;o;()]|[]",
            state.getHash()
        )
    }

    @Test
    fun testConnectednessInvalidA() {
        var state = instance.parseFormulaToState("a,b,c;!a,b", optsStrong)

        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        state = instance.applyMoveOnState(state, MoveAutoClose(4, 1))

        assertFailsWith<IllegalMove> {
            state = instance.applyMoveOnState(state, MoveExpand(5, 1))
        }

        val isConnected = checkConnectedness(state, TableauxType.STRONGLYCONNECTED)
        assertTrue(!isConnected)

        assertEquals(
            "tableauxstate|STRONGLYCONNECTED|false|false|false|{a, b, c}, {!a, b}|" +
                "[true;p;null;-;i;o;(1,2,3)|a;p;0;-;i;o;(4,5)|b;p;0;-;l;o;()|c;p;0;-;l;o;()|a;n;1;1;l;c;()|" +
                "b;p;1;-;i;o;(6,7)|a;n;5;-;l;o;()|b;p;5;-;l;o;()]|[]",
            state.getHash()
        )
    }

    @Test
    fun testConnectednessInvalidB() {
        var state = instance.parseFormulaToState("!a,b;a", optsStrong)

        state = instance.applyMoveOnState(state, MoveExpand(0, 1))
        state = instance.applyMoveOnState(state, MoveExpand(1, 0))
        state = instance.applyMoveOnState(state, MoveAutoClose(2, 1))

        assertFailsWith<IllegalMove> {
            state = instance.applyMoveOnState(state, MoveExpand(3, 0))
        }

        val isConnected = checkConnectedness(state, TableauxType.STRONGLYCONNECTED)
        assertTrue(!isConnected)
        println(state.getHash())
        assertEquals(
            "tableauxstate|STRONGLYCONNECTED|false|false|false|{!a, b}, {a}|[true;p;null;-;i;o;(1)|" +
                "a;p;0;-;i;o;(2,3)|a;n;1;1;l;c;()|b;p;1;-;i;o;(4,5)|a;n;3;-;l;o;()|b;p;3;-;l;o;()]|[]",
            state.getHash()
        )
    }

    @Test
    fun testWeakConnectednessNotClosing() {
        var state = instance.parseFormulaToState("!a,b;a", optsWeak)

        state = instance.applyMoveOnState(state, MoveExpand(0, 1))
        state = instance.applyMoveOnState(state, MoveExpand(1, 0))
        state = instance.applyMoveOnState(state, MoveAutoClose(2, 1))
        state = instance.applyMoveOnState(state, MoveExpand(3, 0))

        assertFailsWith<IllegalMove> {
            state = instance.applyMoveOnState(state, MoveExpand(5, 1))
        }

        val isConnected = checkConnectedness(state, TableauxType.WEAKLYCONNECTED)
        assertTrue(!isConnected)

        assertEquals(
            "tableauxstate|WEAKLYCONNECTED|false|false|false|{!a, b}, {a}|[true;p;null;-;i;o;(1)|" +
                "a;p;0;-;i;o;(2,3)|a;n;1;1;l;c;()|b;p;1;-;i;o;(4,5)|a;n;3;-;l;o;()|b;p;3;-;l;o;()]|[]",
            state.getHash()
        )
    }

    @Test
    fun testStrongConnectednessWrongExpand() {
        var state = instance.parseFormulaToState("!a,b;a", optsStrong)

        state = instance.applyMoveOnState(state, MoveExpand(0, 0))

        assertFailsWith<IllegalMove> {
            state = instance.applyMoveOnState(state, MoveExpand(1, 0))
        }

        println(state.getHash())
        assertEquals(
            "tableauxstate|STRONGLYCONNECTED|false|false|false|{!a, b}, {a}|" +
                "[true;p;null;-;i;o;(1,2)|a;n;0;-;i;o;(3,4)|b;p;0;-;l;o;()|a;n;1;-;l;o;()|" +
                "b;p;1;-;l;o;()]|[]",
            state.getHash()
        )
    }
}
