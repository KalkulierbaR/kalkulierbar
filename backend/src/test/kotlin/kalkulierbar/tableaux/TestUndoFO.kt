package kalkulierbar.tableaux

import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals

class TestUndoFO {

    val instance = FirstOrderTableaux()
    private val param = FoTableauxParam(
        TableauxType.UNCONNECTED,
        regular = false,
        backtracking = true,
        manualVarAssign = false
    )
    private val paramManual = FoTableauxParam(
        TableauxType.UNCONNECTED,
        regular = false,
        backtracking = true,
        manualVarAssign = true
    )
    private var states = mutableListOf<FoTableauxState>()
    private var statesManual = mutableListOf<FoTableauxState>()

    val formula = mutableListOf(
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
        state = instance.applyMoveOnState(state, MoveUndo())
        assertEquals(state.tree.size, 1)
        assertEquals(state.moveHistory.isEmpty(), true)
        // assertEquals(state.usedBacktracking, true)
    }

    @Test
    fun testUndo1() {
        var state = states[1]
        // {!R(a), R(b), !R(b)}, {!R(a), !R(a), !R(b)}
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(2, 1))
        state = instance.applyMoveOnState(state, MoveAutoClose(6, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(4, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(5, 2))

        state = instance.applyMoveOnState(state, MoveUndo())
        state = instance.applyMoveOnState(state, MoveUndo())

        val nodes = state.tree
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

        val map = mapOf("B_2" to "A_1", "A_2" to "A_1")

        // {!R(A), R(A)}, {!R(A), !R(B)}, {!R(A), !R(B)}, {!R(A), !R(A)}
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(2, 1))

        state = instance.applyMoveOnState(state, MoveCloseAssign(3, 2, map))
        state = instance.applyMoveOnState(state, MoveCloseAssign(4, 2, map))

        state = instance.applyMoveOnState(state, MoveUndo())
        state = instance.applyMoveOnState(state, MoveUndo())

        var nodes = state.tree

        // Spelling of nodes remain same
        assertEquals(nodes[2].spelling, "R(A_1)")
        assertEquals(nodes[3].spelling, "R(A_2)")
        assertEquals(nodes[4].spelling, "R(B_2)")

        nodes = state.tree

        // Check spelling after undo
        assertEquals(nodes[2].spelling, "R(A_1)")
        assertEquals(nodes[3].spelling, "R(A_2)")
        assertEquals(nodes[4].spelling, "R(B_2)")

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
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(2, 1))
        state = instance.applyMoveOnState(state, MoveUndo())

        assertEquals(state.moveHistory.size, 1)
        assertEquals(state.usedBacktracking, true)
        assertEquals(state.tree.size, 3)
    }
}
