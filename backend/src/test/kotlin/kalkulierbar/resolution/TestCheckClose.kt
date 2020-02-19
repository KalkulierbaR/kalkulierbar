package kalkulierbar.tests.resolution

import kalkulierbar.resolution.MoveResolve
import kalkulierbar.resolution.PropositionalResolution
import kotlin.test.Test
import kotlin.test.assertEquals

class TestCheckClose {

    val propResoultion = PropositionalResolution()

    @Test
    fun testCheckCloseSimple() {
        var resolutionState = propResoultion.parseFormulaToState("a;!a", null)
        assertEquals(false, propResoultion.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = propResoultion.applyMoveOnState(resolutionState, MoveResolve(0, 1, "a"))
        assertEquals(true, propResoultion.checkCloseOnState(resolutionState).closed)
    }

    @Test
    fun testCheckClose() {
        var resolutionState = propResoultion.parseFormulaToState("a,b;!a;!b", null)
        assertEquals(false, propResoultion.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = propResoultion.applyMoveOnState(resolutionState, MoveResolve(0, 1, "a"))
        resolutionState = propResoultion.applyMoveOnState(resolutionState, MoveResolve(3, 1, "b"))
        assertEquals(true, propResoultion.checkCloseOnState(resolutionState).closed)
    }

    @Test
    fun testCheckCloseComplex() {
        var resolutionState = propResoultion.parseFormulaToState("a,b,!c,d;!a,b,d;!b,!c,d;!d;c", null)
        assertEquals(false, propResoultion.checkCloseOnState(resolutionState).closed)

        resolutionState = propResoultion.applyMoveOnState(resolutionState, MoveResolve(0, 1, "a"))
        resolutionState = propResoultion.applyMoveOnState(resolutionState, MoveResolve(1, 3, "b"))
        resolutionState = propResoultion.applyMoveOnState(resolutionState, MoveResolve(3, 5, "d"))
        assertEquals(false, propResoultion.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = propResoultion.applyMoveOnState(resolutionState, MoveResolve(5, 7, "c"))
        assertEquals(true, propResoultion.checkCloseOnState(resolutionState).closed)
    }

    @Test
    fun testCheckCloseNegative() {
        // Test propositional Resolution
        var resolutionState = propResoultion.parseFormulaToState("a,b,c;!a;!b", null)
        resolutionState = propResoultion.applyMoveOnState(resolutionState, MoveResolve(0, 1, "a"))
        resolutionState = propResoultion.applyMoveOnState(resolutionState, MoveResolve(3, 1, "b"))
        assertEquals(false, propResoultion.checkCloseOnState(resolutionState).closed)
    }
}
