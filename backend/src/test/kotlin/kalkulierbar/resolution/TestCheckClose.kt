package kalkulierbar.resolution

import kotlin.test.Test
import kotlin.test.assertEquals

class TestCheckClose {
    private val propResolution = PropositionalResolution()

    @Test
    fun testCheckCloseSimple() {
        var resolutionState = propResolution.parseFormulaToState("a;!a", null)
        assertEquals(false, propResolution.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = propResolution.applyMoveOnState(resolutionState, MoveResolve(0, 1, "a"))
        assertEquals(true, propResolution.checkCloseOnState(resolutionState).closed)
    }

    @Test
    fun testCheckClose() {
        var resolutionState = propResolution.parseFormulaToState("a,b;!a;!b", null)
        assertEquals(false, propResolution.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = propResolution.applyMoveOnState(resolutionState, MoveResolve(0, 1, "a"))
        resolutionState = propResolution.applyMoveOnState(resolutionState, MoveResolve(3, 1, "b"))
        assertEquals(true, propResolution.checkCloseOnState(resolutionState).closed)
    }

    @Test
    fun testCheckCloseComplex() {
        var resolutionState = propResolution.parseFormulaToState("a,b,!c,d;!a,b,d;!b,!c,d;!d;c", null)
        assertEquals(false, propResolution.checkCloseOnState(resolutionState).closed)

        resolutionState = propResolution.applyMoveOnState(resolutionState, MoveResolve(0, 1, "a"))
        resolutionState = propResolution.applyMoveOnState(resolutionState, MoveResolve(1, 3, "b"))
        resolutionState = propResolution.applyMoveOnState(resolutionState, MoveResolve(3, 5, "d"))
        assertEquals(false, propResolution.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = propResolution.applyMoveOnState(resolutionState, MoveResolve(5, 7, "c"))
        assertEquals(true, propResolution.checkCloseOnState(resolutionState).closed)
    }

    @Test
    fun testCheckCloseNegative() {
        // Test propositional Resolution
        var resolutionState = propResolution.parseFormulaToState("a,b,c;!a;!b", null)
        resolutionState = propResolution.applyMoveOnState(resolutionState, MoveResolve(0, 1, "a"))
        resolutionState = propResolution.applyMoveOnState(resolutionState, MoveResolve(3, 1, "b"))
        assertEquals(false, propResolution.checkCloseOnState(resolutionState).closed)
    }
}
