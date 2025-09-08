package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class TestRegularity {
    val instance = PropositionalTableaux()
    private val opts = TableauxParam(TableauxType.UNCONNECTED, regular = true, backtracking = false)

    // State creation helper function
    private fun createState(
        nodes: List<TableauxNode>,
        state: TableauxState,
    ): TableauxState {
        state.tree.addAll(nodes)

        for (i in nodes.indices) {
            val parentThisNode = nodes[i].parent
            state.tree[parentThisNode!!].children.add(i + 1)
        }
        return state
    }

    @Test
    fun testRegularityValidA() {
        var state = instance.parseFormulaToState("a,b;!a;!b", opts)

        val nodes =
            listOf(
                TableauxNode(0, "a", false),
                TableauxNode(0, "b", false),
                TableauxNode(2, "b", true),
                TableauxNode(1, "a", true),
            )

        state = createState(nodes, state)

        assertTrue(checkRegularity(state))
    }

    @Test
    fun testRegularityValidB() {
        var state = instance.parseFormulaToState("a,b;!a;!b;a", opts)

        val nodes =
            listOf(
                TableauxNode(0, "a", false),
                TableauxNode(0, "b", false),
                TableauxNode(1, "a", true),
                TableauxNode(2, "b", true),
                TableauxNode(4, "a", false),
            )

        state = createState(nodes, state)

        assertTrue(checkRegularity(state))
    }

    @Test
    fun testRegularityValidC() {
        var state = instance.parseFormulaToState("true,false;!true", opts)

        val nodes =
            listOf(
                TableauxNode(0, "true", false),
                TableauxNode(0, "false", false),
                TableauxNode(1, "true", true),
            )

        state = createState(nodes, state)

        assertTrue(checkRegularity(state))
    }

    @Test
    fun testRegularityValidD() {
        val state = instance.parseFormulaToState("true,false;!true", opts)
        assertTrue(checkRegularity(state))
    }

    @Test
    fun testRegularityValidE() {
        var state = instance.parseFormulaToState("a", opts)
        state = createState(listOf(TableauxNode(0, "a", false)), state)
        assertTrue(checkRegularity(state))
    }

    @Test
    fun testRegularityInvalidA() {
        var state = instance.parseFormulaToState("a,b;a;b;!a;!b", opts)

        val nodes =
            listOf(
                TableauxNode(0, "a", false),
                TableauxNode(1, "a", false),
            )

        state = createState(nodes, state)

        assertFalse(checkRegularity(state))
    }

    @Test
    fun testRegularityInvalidB() {
        var state = instance.parseFormulaToState("a,b;a;b;!a;!b", opts)

        val nodes =
            listOf(
                TableauxNode(0, "a", false),
                TableauxNode(1, "a", true),
                TableauxNode(2, "b", false),
                TableauxNode(3, "a", false),
            )

        state = createState(nodes, state)

        assertFalse(checkRegularity(state))
    }

    @Test
    fun testRegularityInvalidC() {
        var state = instance.parseFormulaToState("a,b;a;b;!a;!b", opts)

        val nodes =
            listOf(
                TableauxNode(0, "a", false),
                TableauxNode(0, "b", false),
                TableauxNode(1, "b", false),
                TableauxNode(2, "a", false),
                TableauxNode(2, "b", false),
            )

        state = createState(nodes, state)

        assertFalse(checkRegularity(state))
    }

    @Test
    fun testRegularityInvalidD() {
        var state = instance.parseFormulaToState("true;!true", opts)

        val nodes =
            listOf(
                TableauxNode(0, "true", false),
                TableauxNode(1, "true", true),
                TableauxNode(2, "true", false),
            )

        state = createState(nodes, state)

        assertFalse(checkRegularity(state))
    }

    @Test
    fun testRegularityExpandValidA() {
        var state = instance.parseFormulaToState("a,b,c;!a;!b;!c", opts)
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))

        val expectedHash =
            "tableauxstate|UNCONNECTED|true|false|false|{a, b, c}, {!a}, {!b}, {!c}|" +
                "[true;p;null;-;i;o;(1,2,3)|a;p;0;-;l;o;()|b;p;0;-;l;o;()|c;p;0;-;l;o;()]|[]"
        assertEquals(expectedHash, state.getHash())
    }

    @Test
    fun testRegularityExpandValidB() {
        var state = instance.parseFormulaToState("a,b,c;!a;!b;!c", opts)
        state = instance.applyMoveOnState(state, MoveExpand(0, 1))
        state = instance.applyMoveOnState(state, MoveExpand(1, 0))

        val expectedHash =
            "tableauxstate|UNCONNECTED|true|false|false|{a, b, c}, {!a}, {!b}, {!c}|" +
                "[true;p;null;-;i;o;(1)|a;n;0;-;i;o;(2,3,4)|a;p;1;-;l;o;()|b;p;1;-;l;o;()|c;p;1;-;l;o;()]|[]"
        assertEquals(expectedHash, state.getHash())
    }

    @Test
    fun testRegularityExpandInvalidA() {
        var state = instance.parseFormulaToState("a,b,c;a;b;c", opts)
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveExpand(2, 0))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveExpand(1, 1))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveExpand(2, 2))
        }

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveExpand(3, 3))
        }
    }

    @Test
    fun testRegularityExpandInvalidB() {
        var state = instance.parseFormulaToState("a;b;!a", opts)
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        state = instance.applyMoveOnState(state, MoveExpand(2, 2))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveExpand(3, 0))
        }
    }
}
