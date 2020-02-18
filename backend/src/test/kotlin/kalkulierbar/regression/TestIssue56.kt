package kalkulierbar.tests.regression

import kalkulierbar.tableaux.FirstOrderTableaux
import kalkulierbar.tableaux.FoMoveType
import kalkulierbar.tableaux.FoTableauxMove
import kalkulierbar.tableaux.FoTableauxParam
import kalkulierbar.tableaux.MoveType
import kalkulierbar.tableaux.PropositionalTableaux
import kalkulierbar.tableaux.TableauxMove
import kalkulierbar.tableaux.TableauxParam
import kalkulierbar.tableaux.TableauxType
import kalkulierbar.tableaux.checkRegularity
import kotlin.test.Test

class TestIssue56 {

    @Test
    fun testPropositional() {
        val instance = PropositionalTableaux()
        val formula = "q;!q,r;!q"
        val params = TableauxParam(TableauxType.UNCONNECTED, true, false)
        var state = instance.parseFormulaToState(formula, params)

        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 1, 1))
        state = instance.applyMoveOnState(state, TableauxMove(MoveType.EXPAND, 3, 2))

        assert(checkRegularity(state))
    }

    @Test
    fun testFirstOrder() {
        val instance = FirstOrderTableaux()
        val formula = "\\all Z: Q(Z) & \\all Y: (!Q(Y) | R(c)) & !Q(v)"
        val params = FoTableauxParam(TableauxType.UNCONNECTED, true, false, false)
        var state = instance.parseFormulaToState(formula, params)

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0, mapOf()))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1, mapOf()))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 3, 2, mapOf()))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 4, 1, mapOf()))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 2, 1, mapOf()))

        assert(checkRegularity(state))
        assert(instance.checkCloseOnState(state).closed)
    }
}
