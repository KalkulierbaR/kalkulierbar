package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kotlin.test.Test
import kotlin.test.assertFailsWith

class TestConnectednessFO {

    val instance = FirstOrderTableaux()
    val weak = FoTableauxParam(
        TableauxType.WEAKLYCONNECTED,
        regular = false,
        backtracking = true,
        manualVarAssign = false
    )
    val strong = FoTableauxParam(
        TableauxType.STRONGLYCONNECTED,
        regular = false,
        backtracking = true,
        manualVarAssign = false
    )

    /*
        Test strong connectedness
    */

    @Test
    fun testValidStrongProof() {
        var state = instance.parseFormulaToState("\\all X: P(X) & !P(f(c)) & !P(a,b)", strong)
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        state = instance.applyMoveOnState(state, MoveAutoClose(2, 1))
        val msg = instance.checkCloseOnState(state)
        assert(msg.closed)
    }

    @Test
    fun testInvalidStrongProof() {
        var state = instance.parseFormulaToState("\\all X: P(X) & !P(f(c)) & !P(a,b)", strong)
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, MoveExpand(1, 2))
        }
    }

    /*
        Test weak connectedness
    */

    @Test
    fun testValidWeakProof() {
        var state = instance.parseFormulaToState("\\all X: P(X) & (!P(f(c)) | R(c)) & !P(a,b) & !P(f(c))", weak)
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        state = instance.applyMoveOnState(state, MoveAutoClose(2, 1))
        state = instance.applyMoveOnState(state, MoveExpand(3, 3))
        state = instance.applyMoveOnState(state, MoveAutoClose(4, 1))
        val msg = instance.checkCloseOnState(state)
        assert(msg.closed)
    }

    @Test
    fun testInvalidWeakProofA() {
        var state = instance.parseFormulaToState("\\all X: P(X) & !P(f(c)) & !P(a,b)", weak)
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))

        assertFailsWith<IllegalMove> {
            state = instance.applyMoveOnState(state, MoveExpand(2, 1))
        }
    }

    @Test
    fun testInvalidWeakProofB() {
        var state = instance.parseFormulaToState("\\all X: P(X) & !P(f(c)) & !P(a,b)", weak)
        state = instance.applyMoveOnState(state, MoveExpand(0, 0))

        assertFailsWith<IllegalMove> {
            state = instance.applyMoveOnState(state, MoveExpand(1, 2))
        }
    }
}
