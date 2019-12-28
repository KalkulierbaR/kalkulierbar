package kalkulierbar.tests

import kalkulierbar.tableaux.PropositionalTableaux
import kalkulierbar.tableaux.TableauxMove
import kalkulierbar.tableaux.TableauxNode
import kalkulierbar.tableaux.TableauxParam
import kalkulierbar.tableaux.TableauxType
import kotlin.test.Test
import kotlin.test.assertEquals
import main.kotlin.kalkulierbar.resolution.PropositionalResolution
import main.kotlin.kalkulierbar.resolution.ResolutionMove

class TestCheckClose {

    val propTableaux = PropositionalTableaux()
    val tableauxOpts = TableauxParam(TableauxType.UNCONNECTED, false)

    val propResoultion = PropositionalResolution()

    @Test
    fun testCheckCloseSimple() {
        // Test propositional Tableaux
        var state = propTableaux.parseFormulaToState("a,!a", tableauxOpts)
        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        val nodes = listOf(
                TableauxNode(0, "a", false),
                TableauxNode(1, "a", true)
        )

        state.nodes.addAll(nodes)
        state.nodes.get(0).children.add(1)
        state.nodes.get(1).children.add(2)

        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        // Now close the proof
        state = propTableaux.applyMoveOnState(state, TableauxMove("c", 2, 1))
        assertEquals(true, propTableaux.checkCloseOnState(state).closed)

        // Test propositional Resolution
        var resolutionState = propResoultion.parseFormulaToState("a;!a", null)
        assertEquals(false, propResoultion.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(0, 1, "a"))
        assertEquals(true, propResoultion.checkCloseOnState(resolutionState).closed)
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

        state.nodes.addAll(nodes)
        state.nodes.get(0).children.add(1)
        state.nodes.get(0).children.add(2)
        state.nodes.get(1).children.add(3)
        state.nodes.get(2).children.add(4)

        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        // Now close the proof
        state = propTableaux.applyMoveOnState(state, TableauxMove("c", 3, 1))
        state = propTableaux.applyMoveOnState(state, TableauxMove("c", 4, 2))

        assertEquals(true, propTableaux.checkCloseOnState(state).closed)

        // Test propositional Resolution
        var resolutionState = propResoultion.parseFormulaToState("a,b;!a;!b", null)
        assertEquals(false, propResoultion.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(0, 1, "a"))
        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(2, 3, "b"))
        assertEquals(true, propResoultion.checkCloseOnState(resolutionState).closed)
    }

    @Test
    fun testCheckCloseComplex() {
        var state = propTableaux.parseFormulaToState("a,b;!b;!a", tableauxOpts)

        state = propTableaux.applyMoveOnState(state, TableauxMove("e", 0, 0))
        state = propTableaux.applyMoveOnState(state, TableauxMove("e", 2, 1))
        state = propTableaux.applyMoveOnState(state, TableauxMove("e", 1, 0))
        state = propTableaux.applyMoveOnState(state, TableauxMove("e", 4, 2))
        state = propTableaux.applyMoveOnState(state, TableauxMove("e", 5, 1))

        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        state = propTableaux.applyMoveOnState(state, TableauxMove("c", 3, 2))

        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        state = propTableaux.applyMoveOnState(state, TableauxMove("c", 7, 5))

        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        state = propTableaux.applyMoveOnState(state, TableauxMove("c", 6, 4))

        assertEquals(true, propTableaux.checkCloseOnState(state).closed)

        // Test propositional Resolution
        var resolutionState = propResoultion.parseFormulaToState("a,b,!c,d;!a,b,d;!b,!c,d;!d;c", null)
        assertEquals(false, propResoultion.checkCloseOnState(resolutionState).closed)

        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(0, 1, "a"))
        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(5, 2, "b"))
        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(6, 3, "d"))
        assertEquals(false, propResoultion.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(7, 4, "c"))
        assertEquals(true, propResoultion.checkCloseOnState(resolutionState).closed)
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

        state.nodes.addAll(nodes)
        state.nodes.get(0).children.addAll(listOf(1, 2, 3))
        state.nodes.get(1).children.add(4)
        state.nodes.get(2).children.add(5)
        state.nodes.get(3).children.add(6)

        // Don't close proof completely
        state = propTableaux.applyMoveOnState(state, TableauxMove("c", 6, 3))
        state = propTableaux.applyMoveOnState(state, TableauxMove("c", 4, 1))

        assertEquals(false, propTableaux.checkCloseOnState(state).closed)

        // Test propositional Resolution
        var resolutionState = propResoultion.parseFormulaToState("a,b,c;!a;!b", null)
        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(0, 1, "a"))
        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(2, 3, "b"))
        assertEquals(false, propResoultion.checkCloseOnState(resolutionState).closed)
    }
}
