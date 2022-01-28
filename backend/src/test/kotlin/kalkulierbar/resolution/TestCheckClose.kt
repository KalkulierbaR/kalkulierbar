package kalkulierbar.resolution

import kotlin.test.Test
import kotlin.test.assertEquals

class TestCheckClose {

    private val PropResolution = PropositionalResolution()

    @Test
    fun testCheckCloseSimple() {
        var resolutionState = PropResolution.parseFormulaToState("a;!a", null)
        assertEquals(false, PropResolution.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = PropResolution.applyMoveOnState(resolutionState, MoveResolve(0, 1, "a"))
        assertEquals(true, PropResolution.checkCloseOnState(resolutionState).closed)
    }

    @Test
    fun testCheckClose() {
        var resolutionState = PropResolution.parseFormulaToState("a,b;!a;!b", null)
        assertEquals(false, PropResolution.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = PropResolution.applyMoveOnState(resolutionState, MoveResolve(0, 1, "a"))
        resolutionState = PropResolution.applyMoveOnState(resolutionState, MoveResolve(3, 1, "b"))
        assertEquals(true, PropResolution.checkCloseOnState(resolutionState).closed)
    }

    @Test
    fun testCheckCloseComplex() {
        var resolutionState = PropResolution.parseFormulaToState("a,b,!c,d;!a,b,d;!b,!c,d;!d;c", null)
        assertEquals(false, PropResolution.checkCloseOnState(resolutionState).closed)

        resolutionState = PropResolution.applyMoveOnState(resolutionState, MoveResolve(0, 1, "a"))
        resolutionState = PropResolution.applyMoveOnState(resolutionState, MoveResolve(1, 3, "b"))
        resolutionState = PropResolution.applyMoveOnState(resolutionState, MoveResolve(3, 5, "d"))
        assertEquals(false, PropResolution.checkCloseOnState(resolutionState).closed)

        // Now close the proof
        resolutionState = PropResolution.applyMoveOnState(resolutionState, MoveResolve(5, 7, "c"))
        assertEquals(true, PropResolution.checkCloseOnState(resolutionState).closed)
    }

    @Test
    fun testCheckCloseNegative() {
        // Test propositional Resolution
        var resolutionState = PropResolution.parseFormulaToState("a,b,c;!a;!b", null)
        resolutionState = PropResolution.applyMoveOnState(resolutionState, MoveResolve(0, 1, "a"))
        resolutionState = PropResolution.applyMoveOnState(resolutionState, MoveResolve(3, 1, "b"))
        assertEquals(false, PropResolution.checkCloseOnState(resolutionState).closed)
    }
}
