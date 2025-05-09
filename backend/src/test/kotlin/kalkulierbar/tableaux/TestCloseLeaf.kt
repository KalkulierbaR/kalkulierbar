package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestCloseLeaf {
    val instance = PropositionalTableaux()
    private val opts = TableauxParam(TableauxType.UNCONNECTED, regular = false, backtracking = false)

    @Test
    fun testApplyCloseValidA() {
        var state = instance.parseFormulaToState("a,b;!b", opts)

        val nodes =
            listOf(
                TableauxNode(0, "a", false),
                TableauxNode(0, "b", false),
                TableauxNode(2, "b", true),
            )
        state = createArtificialExpandState(nodes, state)
        state = instance.applyMoveOnState(state, MoveAutoClose(3, 2))

        assertEquals(true, state.tree[3].isClosed)
        assertEquals(2, state.tree[3].closeRef)
        assertEquals(
            "tableauxstate|UNCONNECTED|false|false|false|{a, b}, {!b}|" +
                "[true;p;null;-;i;o;(1,2)|a;p;0;-;l;o;()|b;p;0;-;i;c;(3)|b;n;2;2;l;c;()]|[]",
            state.getHash(),
        )
    }

    @Test
    fun testApplyCloseValidB() {
        var state = instance.parseFormulaToState("a,b,c;!a;!b;!c", opts)

        val nodes =
            listOf(
                TableauxNode(0, "b", true),
                TableauxNode(1, "a", false),
                TableauxNode(1, "b", false),
                TableauxNode(1, "c", false),
            )
        state = createArtificialExpandState(nodes, state)
        state = instance.applyMoveOnState(state, MoveAutoClose(3, 1))

        assertEquals(true, state.tree[3].isClosed)

        assertEquals(false, state.tree[2].isClosed)
        assertEquals(false, state.tree[4].isClosed)

        assertEquals(1, state.tree[3].closeRef)
        assertEquals(
            "tableauxstate|UNCONNECTED|false|false|false|{a, b, c}, {!a}, {!b}, {!c}|" +
                "[true;p;null;-;i;o;(1)|b;n;0;-;i;o;(2,3,4)|a;p;1;-;l;o;()|" +
                "b;p;1;1;l;c;()|c;p;1;-;l;o;()]|[]",
            state.getHash(),
        )
    }

    @Test
    fun testApplyCloseValidC() {
        var state = instance.parseFormulaToState("a,b,c;!a;!b;!c", opts)

        val nodes =
            listOf(
                TableauxNode(0, "a", false),
                TableauxNode(0, "b", false),
                TableauxNode(0, "c", false),
                TableauxNode(1, "a", true),
                TableauxNode(2, "b", true),
            )
        state = createArtificialExpandState(nodes, state)

        state = instance.applyMoveOnState(state, MoveAutoClose(4, 1))
        state = instance.applyMoveOnState(state, MoveAutoClose(5, 2))

        assertEquals(true, state.tree[4].isClosed)
        assertEquals(true, state.tree[5].isClosed)

        assertEquals(false, state.tree[3].isClosed)

        assertEquals(1, state.tree[4].closeRef)
        assertEquals(2, state.tree[5].closeRef)
        assertEquals(
            "tableauxstate|UNCONNECTED|false|false|false|{a, b, c}, {!a}, {!b}, {!c}|" +
                "[true;p;null;-;i;o;(1,2,3)|a;p;0;-;i;c;(4)|b;p;0;-;i;c;(5)|c;p;0;-;l;o;()|a;n;1;1;l;c;()|" +
                "b;n;2;2;l;c;()]|[]",
            state.getHash(),
        )
    }

    @Test
    fun testCloseLeafIndexOOB() {
        val state = instance.parseFormulaToState("a,b;c", opts)

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(42, 1))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(-15, 1))
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    fun testCloseIndexOOB() {
        var state = instance.parseFormulaToState("a,b;c", opts)

        val nodes =
            listOf(
                TableauxNode(0, "a", false),
                TableauxNode(0, "b", false),
                TableauxNode(1, "a", false),
                TableauxNode(1, "b", false),
            )
        state = createArtificialExpandState(nodes, state)

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(3, 403))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(4, -3))
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    fun testCloseOnNonLeaf() {
        var state = instance.parseFormulaToState("a,b;c", opts)

        val nodes =
            listOf(
                TableauxNode(0, "c", false),
                TableauxNode(1, "c", false),
            )
        state = createArtificialExpandState(nodes, state)

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(1, 2))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(2, 1))
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    fun testCloseWithNonPath() {
        var state = instance.parseFormulaToState("a,b;!b", opts)

        val nodes =
            listOf(
                TableauxNode(0, "a", false),
                TableauxNode(0, "b", false),
                TableauxNode(1, "a", false),
                TableauxNode(1, "b", false),
                TableauxNode(2, "b", true),
                TableauxNode(5, "a", false),
                TableauxNode(5, "b", false),
            )
        state = createArtificialExpandState(nodes, state)

        val hash = state.getHash()

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(4, 5))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(5, 4))
        }

        assertEquals(hash, state.getHash()) // Verify that state has not been modified
    }

    @Test
    fun testCloseClosedLeaf() {
        var state = instance.parseFormulaToState("c;!c", opts)

        val nodes =
            listOf(
                TableauxNode(0, "c", false),
                TableauxNode(1, "c", true),
            )
        state = createArtificialExpandState(nodes, state)
        state = instance.applyMoveOnState(state, MoveAutoClose(2, 1))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(2, 1))
        }
    }

    @Test
    fun testCloseWrongVariable() {
        var state = instance.parseFormulaToState("a;!c", opts)

        val nodes =
            listOf(
                TableauxNode(0, "a", false),
                TableauxNode(1, "c", true),
            )
        state = createArtificialExpandState(nodes, state)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(2, 1))
        }
    }

    @Test
    fun testCloseWithRoot() {
        var state = instance.parseFormulaToState("!true", opts)

        val nodes =
            listOf(
                TableauxNode(0, "true", true),
            )
        state = createArtificialExpandState(nodes, state)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveAutoClose(1, 0))
        }
    }

    @Test
    fun testSubtreeCloseMarking() {
        var state = instance.parseFormulaToState("b,a;!b;!a,b", opts)

        val nodes =
            listOf(
                TableauxNode(0, "b", false),
                TableauxNode(0, "a", false),
                TableauxNode(1, "b", false),
                TableauxNode(1, "a", false),
                TableauxNode(2, "b", true),
                TableauxNode(5, "a", true),
                TableauxNode(5, "b", false),
            )
        state = createArtificialExpandState(nodes, state)

        state = instance.applyMoveOnState(state, MoveAutoClose(7, 5))

        assertEquals(true, state.tree[7].isClosed)
        assertEquals(false, state.tree[5].isClosed)

        state = instance.applyMoveOnState(state, MoveAutoClose(6, 2))

        println(state.getHash())

        assertEquals(true, state.tree[7].isClosed)
        assertEquals(true, state.tree[6].isClosed)
        assertEquals(true, state.tree[5].isClosed)
        assertEquals(true, state.tree[2].isClosed)
        assertEquals(false, state.tree[0].isClosed)
        assertEquals(null, state.tree[5].closeRef)
        assertEquals(null, state.tree[2].closeRef)
    }
}
