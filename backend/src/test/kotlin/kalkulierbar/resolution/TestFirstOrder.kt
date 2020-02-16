package kalkulierbar.tests.resolution

import kalkulierbar.IllegalMove
import kalkulierbar.resolution.FirstOrderResolution
import kalkulierbar.resolution.MoveHide
import kalkulierbar.resolution.MoveInstantiate
import kalkulierbar.resolution.MoveShow
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestFirstOrder {

    val instance = FirstOrderResolution()

    @Test
    fun testClauseIndexOOB() {
        val state = instance.parseFormulaToState("\\all X: \\all Y: R(X, f(Y, c))", null)
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveInstantiate(1, mapOf()))
        }
        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveInstantiate(-1, mapOf()))
        }
    }

    @Test
    fun testInstantiationA() {
        var state = instance.parseFormulaToState("\\all X: \\all Y: R(X, f(Y, c))", null)

        state = instance.applyMoveOnState(state, MoveInstantiate(0, mapOf("X" to "g(i)")))
        assertEquals(2, state.clauseSet.clauses.size)
        assertEquals("{R(g(i), f(Y, c))}", state.clauseSet.clauses[1].toString())
        assertEquals("{R(X, f(Y, c))}", state.clauseSet.clauses[0].toString())
    }

    @Test
    fun testInstantiationB() {
        var state = instance.parseFormulaToState("\\all X: \\all Y: R(X, f(Y, c))", null)

        state = instance.applyMoveOnState(state, MoveInstantiate(0, mapOf("Y" to "v")))
        assertEquals(2, state.clauseSet.clauses.size)
        assertEquals("{R(X, f(v, c))}", state.clauseSet.clauses[1].toString())
        assertEquals("{R(X, f(Y, c))}", state.clauseSet.clauses[0].toString())
    }

    @Test
    fun testInstantiationC() {
        var state = instance.parseFormulaToState("\\all X: \\all Y: R(X, f(Y, c))", null)

        state = instance.applyMoveOnState(state, MoveInstantiate(0, mapOf("X" to "u", "Y" to "v")))
        assertEquals(2, state.clauseSet.clauses.size)
        assertEquals("{R(u, f(v, c))}", state.clauseSet.clauses[1].toString())
        assertEquals("{R(X, f(Y, c))}", state.clauseSet.clauses[0].toString())
    }

    /*@Test
    fun testAutoResolve() {
        var state = instance.parseFormulaToState("(R(c) | R(i)) & (!R(c) | R(i))", FoResolutionParam(true))
        state = instance.applyMoveOnState(state, MoveResolve(0, 1, null))
        assertEquals(3, state.clauseSet.clauses.size)
        assertEquals("{R(c), R(i)}, {R(i)}, {!R(c), R(i)}", state.clauseSet.toString())
    }

    @Test
    fun testManualResolve() {
        var state = instance.parseFormulaToState("(R(c) | R(i)) & (!R(c) | R(i))", FoResolutionParam(true))
        state = instance.applyMoveOnState(state, MoveResolve(0, 1, "R(c)"))
        assertEquals(3, state.clauseSet.clauses.size)
        assertEquals("{R(c), R(i)}, {R(i)}, {!R(c), R(i)}", state.clauseSet.toString())
    }

    @Test
    fun testCheckClose() {
        var state = instance.parseFormulaToState("R(c) & !R(c)", null)
        state = instance.applyMoveOnState(state, MoveResolve(0, 1, "R(c)"))
        val msg = instance.checkCloseOnState(state)
        assert(msg.closed)
    }*/

    @Test
    fun testShowHide() {
        var state = instance.parseFormulaToState("R(c)", null)
        val ref = state.getHash()
        state = instance.applyMoveOnState(state, MoveHide(0))
        assert(state.clauseSet.clauses.isEmpty())
        state = instance.applyMoveOnState(state, MoveShow())

        assertEquals(ref, state.getHash())
    }
}
