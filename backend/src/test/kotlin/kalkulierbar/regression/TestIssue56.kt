package kalkulierbar.regression

import kalkulierbar.tableaux.FirstOrderTableaux
import kalkulierbar.tableaux.FoTableauxParam
import kalkulierbar.tableaux.MoveAutoClose
import kalkulierbar.tableaux.MoveExpand
import kalkulierbar.tableaux.PropositionalTableaux
import kalkulierbar.tableaux.TableauxParam
import kalkulierbar.tableaux.TableauxType
import kalkulierbar.tableaux.checkRegularity
import kotlin.test.Test

// based on issue #56 in internal gitlab, now inaccessible
class TestIssue56 {

    @Test
    fun testPropositional() {
        val instance = PropositionalTableaux()
        val formula = "q;!q,r;!q"
        val params = TableauxParam(TableauxType.UNCONNECTED, true, false)
        var state = instance.parseFormulaToState(formula, params)

        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        state = instance.applyMoveOnState(state, MoveExpand(3, 2))

        assert(checkRegularity(state))
    }

    @Test
    fun testFirstOrder() {
        val instance = FirstOrderTableaux()
        val formula = "\\all Z: Q(Z) & \\all Y: (!Q(Y) | R(c)) & !Q(v)"
        val params = FoTableauxParam(TableauxType.UNCONNECTED, true, false, false)
        var state = instance.parseFormulaToState(formula, params)

        state = instance.applyMoveOnState(state, MoveExpand(0, 0))
        state = instance.applyMoveOnState(state, MoveExpand(1, 1))
        state = instance.applyMoveOnState(state, MoveExpand(3, 2))
        state = instance.applyMoveOnState(state, MoveAutoClose(4, 1))
        state = instance.applyMoveOnState(state, MoveAutoClose(2, 1))

        assert(checkRegularity(state))
        assert(instance.checkCloseOnState(state).closed)
    }
}
