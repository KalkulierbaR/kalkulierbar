package kalkulierbar.tableaux

import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals

class TestUndoFO {

    val instance = FirstOrderTableaux()
    val param = FoTableauxParam(TableauxType.UNCONNECTED, false, true, false)
    val paramManual = FoTableauxParam(TableauxType.UNCONNECTED, false, true, true)
    var states = mutableListOf<FoTableauxState>()
    var statesManual = mutableListOf<FoTableauxState>()

    val formula = mutableListOf<String>(
            "\\all X: R(X) & R(c) & !R(c)",
            "\\all A: (\\all B: (R(A) -> R(B) & !R(A) | !R(B)))",
            "\\all A: (R(A) -> !\\ex B: (R(A) & !R(B) -> R(B) | R(A)))"
    )

    @BeforeTest
    fun createStates() {
        for (f in formula) {
            states.add(instance.parseFormulaToState(f, param))
            statesManual.add(instance.parseFormulaToState(f, paramManual))
        }
    }

    @Test
    fun testTrueNode() {
        var state = states[0]
        assertEquals(state.usedBacktracking, false)

        // Kein Error wird geworfen bei Anfangszustand
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.UNDO, 0, 0))
        assertEquals(state.nodes.size, 1)
        assertEquals(state.moveHistory.isEmpty(), true)
        // assertEquals(state.usedBacktracking, true)
    }

    @Test
    fun testUndo1() {
        var state = states[1]
        // {!R(a), R(b), !R(b)}, {!R(a), !R(a), !R(b)}
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 1))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 6, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 4, 2))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 5, 2))

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.UNDO, Integer.MAX_VALUE, Integer.MIN_VALUE))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.UNDO, -1, 1))

        val nodes = state.nodes
        // check for leaf closed and close ref
        assertEquals(nodes[6].isClosed, true)
        assertEquals(nodes[6].closeRef, 2)

        assertEquals(nodes[2].isClosed, false)
        assertEquals(nodes[4].isClosed, false)
        assertEquals(nodes[4].closeRef, null)
        assertEquals(nodes[5].isClosed, false)
        assertEquals(nodes[5].closeRef, null)

        assertEquals(state.usedBacktracking, true)
        // assertEquals(state.moveHistory[state.moveHistory.size - 1].type, FoMoveType.AUTOCLOSE)
    }

    @Test
    fun testUndo2() {
        var state = statesManual[2]

        val map = mapOf("Bv2" to "Av1", "Av2" to "Av1")

        // {!R(A), R(A)}, {!R(A), !R(B)}, {!R(A), !R(B)}, {!R(A), !R(A)}
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 1))

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 3, 2, map))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 4, 2, map))

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.UNDO, 4, 2, map))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.UNDO, 4, 2, map))

        var nodes = state.nodes

        // Spelling of nodes remain same
        assertEquals(nodes[2].spelling, "R(Av1)")
        assertEquals(nodes[3].spelling, "R(Av2)")
        assertEquals(nodes[4].spelling, "R(Bv2)")

        nodes = state.nodes

        // Check spelling after undo
        assertEquals(nodes[2].spelling, "R(Av1)")
        assertEquals(nodes[3].spelling, "R(Av2)")
        assertEquals(nodes[4].spelling, "R(Bv2)")

        assertEquals(nodes[2].isClosed, false)
        assertEquals(nodes[3].isClosed, false)
        assertEquals(nodes[3].closeRef, null)
        assertEquals(nodes[4].isClosed, false)
        assertEquals(nodes[4].closeRef, null)
    }

    @Test
    fun testUndoExpand3() {
        var state = states[2]
        // {!R(A), R(A)}, {!R(A), !R(B)}, {!R(A), !R(B)}, {!R(A), !R(A)}
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 1))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.UNDO, 0, 1))

        assertEquals(state.moveHistory.size, 1)
        assertEquals(state.usedBacktracking, true)
        assertEquals(state.nodes.size, 3)
    }
}
