
package kalkulierbar.tests

import kalkulierbar.tableaux.MoveType
import kalkulierbar.tableaux.PropositionalTableaux
import kalkulierbar.tableaux.TableauxMove
import kalkulierbar.tableaux.TableauxNode
import kalkulierbar.tableaux.TableauxParam
import kalkulierbar.tableaux.TableauxType
import kotlin.test.Test
import kotlin.test.assertEquals

class TestCheckClose {

    val instance = PropositionalTableaux()
    val opts = TableauxParam(TableauxType.UNCONNECTED, false)

    @Test
    fun testCheckCloseSimple() {
        var state = instance.parseFormulaToState("a,!a", opts)

        assertEquals(false, instance.checkCloseOnState(state).closed)

        val nodes = listOf(
                TableauxNode(0, "a", false),
                TableauxNode(1, "a", true)
        )

        state.nodes.addAll(nodes)
        state.nodes.get(0).children.add(1)
        state.nodes.get(1).children.add(2)

        assertEquals(false, instance.checkCloseOnState(state).closed)

        // Now close the proof
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 2, 1))

        assertEquals(true, instance.checkCloseOnState(state).closed)
    }

    @Test
    fun testCheckClose() {
        var state = instance.parseFormulaToState("a,b;!a,!b", opts)

        assertEquals(false, instance.checkCloseOnState(state).closed)

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

        assertEquals(false, instance.checkCloseOnState(state).closed)

        // Now close the proof
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 3, 1))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 4, 2))

        assertEquals(true, instance.checkCloseOnState(state).closed)
    }

    @Test
    fun testCheckCloseComplex() {
        var state = instance.parseFormulaToState("a,b;!b;!a", opts)

        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 2, 1))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 1, 0))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 4, 2))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 5, 1))

        assertEquals(false, instance.checkCloseOnState(state).closed)

        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 3, 2))

        assertEquals(false, instance.checkCloseOnState(state).closed)

        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 7, 5))

        assertEquals(false, instance.checkCloseOnState(state).closed)

        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 6, 4))

        assertEquals(true, instance.checkCloseOnState(state).closed)
    }

    @Test
    fun testCheckCloseNegative() {
        var state = instance.parseFormulaToState("a,b,c;!a;!b;!c", opts)

        val nodes = listOf(
                TableauxNode(0, "a", false),
                TableauxNode(0, "b", false),
                TableauxNode(0, "c", false),
                TableauxNode(1, "a", true),
                TableauxNode(2, "b", true),
                TableauxNode(3, "c", true)
        )

        state.nodes.addAll(nodes)
        state.nodes.get(0).children.addAll(listOf(1, 2, 3))
        state.nodes.get(1).children.add(4)
        state.nodes.get(2).children.add(5)
        state.nodes.get(3).children.add(6)

        // Don't close proof completely
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 6, 3))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.CLOSE, 4, 1))

        assertEquals(false, instance.checkCloseOnState(state).closed)
    }
}
