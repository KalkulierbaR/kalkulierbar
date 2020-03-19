package kalkulierbar.tests.tableaux

import kalkulierbar.IllegalMove
import kalkulierbar.tableaux.MoveAutoClose
import kalkulierbar.tableaux.MoveExpand
import kalkulierbar.tableaux.MoveUndo
import kalkulierbar.tableaux.PropositionalTableaux
import kalkulierbar.tableaux.TableauxParam
import kalkulierbar.tableaux.TableauxType
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestUndo {

    val instance = PropositionalTableaux()
    val opts = TableauxParam(TableauxType.UNCONNECTED, false, true)

    @Test
    fun testUndoDisabled() {
        val state = instance.parseFormulaToState("a,b;c", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveUndo())
        }
    }

    @Test
    fun testUndoInitial() {
        val state = instance.parseFormulaToState("a,b,c;d", opts)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveUndo())
        }
    }

    @Test
    fun testUndoFlag() {
        var state = instance.parseFormulaToState("a,b,c;d", opts)

        state = instance.applyMoveOnState(state, MoveExpand(0, 0))

        assertEquals(false, state.usedBacktracking)

        state = instance.applyMoveOnState(state, MoveUndo())

        assert(state.usedBacktracking)

        state = instance.applyMoveOnState(state, MoveExpand(0, 0))

        assert(state.usedBacktracking)
    }

    @Test
    fun testUndoExpandSimple() {
        var state = instance.parseFormulaToState("a,b;c;!a", opts)
        state.usedBacktracking = true // Set to true to enable hash comparison
        val prestateHash = state.getHash()

        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveUndo())

        assertEquals(prestateHash, state.getHash())
    }

    @Test
    fun testUndoCloseSimple() {
        var state = instance.parseFormulaToState("a;!a", opts)
        state.usedBacktracking = true // Set to true to enable hash comparison

        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        val prestateHash = state.getHash()

        state = instance.applyMoveOnState(state, MoveAutoClose(2, 1))
        state = instance.applyMoveOnState(state, MoveUndo())

        assertEquals(prestateHash, state.getHash())
    }

    @Test
    fun testUndoComplex() {
        var state = instance.parseFormulaToState("a,b,c;!a;!b;!c", opts)
        state.usedBacktracking = true // Set to true to enable hash comparison

        val s1 = state.getHash()
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        val s2 = state.getHash()
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        val s3 = state.getHash()
        state = instance.applyMoveOnState(state, MoveAutoClose(4, 1))
        val s4 = state.getHash()
        state = instance.applyMoveOnState(state, MoveExpand(3, 0))
        val s5 = state.getHash()
        state = instance.applyMoveOnState(state, MoveExpand(5, 1))
        val s6 = state.getHash()
        state = instance.applyMoveOnState(state, MoveAutoClose(8, 5))

        state = instance.applyMoveOnState(state, MoveUndo())
        assertEquals(s6, state.getHash())
        state = instance.applyMoveOnState(state, MoveUndo())
        assertEquals(s5, state.getHash())
        state = instance.applyMoveOnState(state, MoveUndo())
        assertEquals(s4, state.getHash())
        state = instance.applyMoveOnState(state, MoveUndo())
        assertEquals(s3, state.getHash())
        state = instance.applyMoveOnState(state, MoveUndo())
        assertEquals(s2, state.getHash())
        state = instance.applyMoveOnState(state, MoveUndo())
        assertEquals(s1, state.getHash())
    }
}
