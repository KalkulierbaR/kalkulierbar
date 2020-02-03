package kalkulierbar.tests.tableaux

import kalkulierbar.IllegalMove
import kalkulierbar.tableaux.FirstOrderTableaux
import kalkulierbar.tableaux.FoMoveType
import kalkulierbar.tableaux.FoTableauxMove
import kalkulierbar.tableaux.FoTableauxParam
import kalkulierbar.tableaux.TableauxType
import kotlin.test.Test
import kotlin.test.assertFailsWith

class TestConnectednessFO {

    val instance = FirstOrderTableaux()
    val weak = FoTableauxParam(TableauxType.WEAKLYCONNECTED, false, true, false)
    val strong = FoTableauxParam(TableauxType.STRONGLYCONNECTED, false, true, false)

    /*
        Test strong connectedness
    */

    @Test
    fun testValidStrongProof() {
        var state = instance.parseFormulaToState("\\all X: P(X) & !P(f(c)) & !P(a,b)", strong)
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0, mapOf()))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1, mapOf()))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 2, 1, mapOf()))
        val msg = instance.checkCloseOnState(state)
        assert(msg.closed)
    }

    @Test
    fun testInvalidStrongProof() {
        var state = instance.parseFormulaToState("\\all X: P(X) & !P(f(c)) & !P(a,b)", strong)
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0, mapOf()))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 2, mapOf()))
        }
    }

    /*
        Test weak connectedness
    */

    @Test
    fun testValidWeakProof() {
        var state = instance.parseFormulaToState("\\all X: P(X) & (!P(f(c)) | R(c)) & !P(a,b) & !P(f(c))", weak)
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0, mapOf()))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1, mapOf()))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 2, 1, mapOf()))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 3, 3, mapOf()))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 4, 1, mapOf()))
        val msg = instance.checkCloseOnState(state)
        assert(msg.closed)
    }

    @Test
    fun testInvalidWeakProofA() {
        var state = instance.parseFormulaToState("\\all X: P(X) & !P(f(c)) & !P(a,b)", weak)
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0, mapOf()))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1, mapOf()))

        assertFailsWith<IllegalMove> {
            state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 1, mapOf()))
        }
    }

    @Test
    fun testInvalidWeakProofB() {
        var state = instance.parseFormulaToState("\\all X: P(X) & !P(f(c)) & !P(a,b)", weak)
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0, mapOf()))

        assertFailsWith<IllegalMove> {
            state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 2, mapOf()))
        }
    }
}
