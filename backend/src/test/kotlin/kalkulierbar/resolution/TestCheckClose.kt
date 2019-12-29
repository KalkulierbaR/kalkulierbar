package kalkulierbar.tests.resolution

import kalkulierbar.resolution.PropositionalResolution
import kalkulierbar.resolution.ResolutionMove
import kotlin.test.Test
import kotlin.test.assertEquals

class TestCheckClose {

    val propResoultion = PropositionalResolution()

    @Test
    fun testCheckCloseSimple() {
        var resolutionState = propResoultion.parseFormulaToState("a;!a", null)
        assertEquals(false, propResoultion.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(0, 1, "a"))
        assertEquals(true, propResoultion.checkCloseOnState(resolutionState).closed)
    }

    @Test
    fun testCheckClose() {
        var resolutionState = propResoultion.parseFormulaToState("a,b;!a;!b", null)
        assertEquals(false, propResoultion.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(0, 1, "a"))
        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(2, 3, "b"))
        assertEquals(true, propResoultion.checkCloseOnState(resolutionState).closed)
    }

    @Test
    fun testCheckCloseComplex() {
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
        // Test propositional Resolution
        var resolutionState = propResoultion.parseFormulaToState("a,b,c;!a;!b", null)
        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(0, 1, "a"))
        resolutionState = propResoultion.applyMoveOnState(resolutionState, ResolutionMove(2, 3, "b"))
        assertEquals(false, propResoultion.checkCloseOnState(resolutionState).closed)
    }
}
