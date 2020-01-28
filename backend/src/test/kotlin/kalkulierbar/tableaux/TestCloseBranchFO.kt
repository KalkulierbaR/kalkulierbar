package kalkulierbar.tableaux

import kalkulierbar.IllegalMove
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertFailsWith

class TestCloseBranchFO {

    val instance = FirstOrderTableaux()
    val param = FoTableauxParam(TableauxType.UNCONNECTED, true, false, true)
    var states = mutableListOf<FoTableauxState>()

    val formula = listOf<String>(
            "\\all X: R(X) & R(c) & !R(c)",
            "\\all X: \\ex Y: R(X,Y) & \\ex Z: \\all W: !R(Z, W)" // R(X, sk1(X)), !R(sk2, W)
    )

    @BeforeTest
    fun createStates() {
        for (f in formula) {
            states.add(instance.parseFormulaToState(f, param))
        }
    }

    @Test
    fun testRegularityViolation() {
        var state = states[0]
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 2, 2))

        assertFailsWith<IllegalMove> {
            val move = FoTableauxMove(FoMoveType.CLOSE, 3, 1, mapOf("Xv1" to "c"))
            instance.applyMoveOnState(state, move)
        }
    }

    @Test
    fun testManualVarAssignOnly() {
        var state = states[0]
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 1))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 2))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.AUTOCLOSE, 2, 1))
        }
    }

    @Test
    fun testIncorrectInstantiation() {
        var state = states[1]

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))

        val incorrect = mapOf("Xv1" to "sk2", "Wv2" to "sk1(c)") // Should be sk1(sk2)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 2, 1, incorrect))
        }
    }

    @Test
    fun testValid() {
        var state = states[1]

        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 0, 0))
        state = instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.EXPAND, 1, 1))

        val correct = mapOf("Xv1" to "sk2", "Wv2" to "sk1(sk2)")

        instance.applyMoveOnState(state, FoTableauxMove(FoMoveType.CLOSE, 2, 1, correct))
        val msg = instance.checkCloseOnState(state)

        assert(msg.closed)
    }
}
