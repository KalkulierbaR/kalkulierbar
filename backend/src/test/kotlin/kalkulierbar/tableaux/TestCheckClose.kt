package kalkulierbar.tests.tableaux

import kalkulierbar.tableaux.*
import kotlin.test.Test
import kotlin.test.assertEquals

class TestCheckClose {

    val propTableaux = PropositionalTableaux()
    val tableauxOpts = TableauxParam(TableauxType.UNCONNECTED, regular = false, backtracking = false)

    @Test
    fun testCheckCloseSimple() {
        var state = propTableaux.parseFormulaToState("a,!a", tableauxOpts)
        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(1, "a", true)
        )

        state.tree.addAll(nodes)
        state.tree[0].children.add(1)
        state.tree[1].children.add(2)

        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        // Now close the proof
        state = propTableaux.applyMoveOnState(state, MoveAutoClose(2, 1))
        assertEquals(true, propTableaux.checkCloseOnState(state).closed)
    }

    @Test
    fun testCheckClose() {
        var state = propTableaux.parseFormulaToState("a,b;!a,!b", tableauxOpts)

        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(0, "b", false),
            TableauxNode(1, "a", true),
            TableauxNode(2, "b", true)
        )

        state.tree.addAll(nodes)
        state.tree[0].children.add(1)
        state.tree[0].children.add(2)
        state.tree[1].children.add(3)
        state.tree[2].children.add(4)

        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        // Now close the proof
        state = propTableaux.applyMoveOnState(state, MoveAutoClose(3, 1))
        state = propTableaux.applyMoveOnState(state, MoveAutoClose(4, 2))

        assertEquals(true, propTableaux.checkCloseOnState(state).closed)
    }

    @Test
    fun testCheckCloseComplex() {
        var state = propTableaux.parseFormulaToState("a,b;!b;!a", tableauxOpts)

        state = propTableaux.applyMoveOnState(state, MoveExpand(0, 0))
        state = propTableaux.applyMoveOnState(state, MoveExpand(2, 1))
        state = propTableaux.applyMoveOnState(state, MoveExpand(1, 0))
        state = propTableaux.applyMoveOnState(state, MoveExpand(4, 2))
        state = propTableaux.applyMoveOnState(state, MoveExpand(5, 1))

        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        state = propTableaux.applyMoveOnState(state, MoveAutoClose(3, 2))

        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        state = propTableaux.applyMoveOnState(state, MoveAutoClose(7, 5))

        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        state = propTableaux.applyMoveOnState(state, MoveAutoClose(6, 4))

        assertEquals(true, propTableaux.checkCloseOnState(state).closed)
    }

    @Test
    fun testCheckCloseNegative() {
        var state = propTableaux.parseFormulaToState("a,b,c;!a;!b;!c", tableauxOpts)

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(0, "b", false),
            TableauxNode(0, "c", false),
            TableauxNode(1, "a", true),
            TableauxNode(2, "b", true),
            TableauxNode(3, "c", true)
        )

        state.tree.addAll(nodes)
        state.tree[0].children.addAll(listOf(1, 2, 3))
        state.tree[1].children.add(4)
        state.tree[2].children.add(5)
        state.tree[3].children.add(6)

        // Don't close proof completely
        state = propTableaux.applyMoveOnState(state, MoveAutoClose(6, 3))
        state = propTableaux.applyMoveOnState(state, MoveAutoClose(4, 1))

        assertEquals(false, propTableaux.checkCloseOnState(state).closed)
    }
}
