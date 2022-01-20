package kalkulierbar.signedtableaux

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.ModalLogicParser
import kotlin.test.Test
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class TestNuMove {

    val instance = SignedModalTableaux()
    val parser = ModalLogicParser()

    @Test
    fun testBasicBox() {
        var state = instance.parseFormulaToState("\\sign T: <>a & []a", null)

        state = instance.applyMoveOnState(state, AlphaMove(0, null))
        state = instance.applyMoveOnState(state, PiMove(1, 1, null))
        state = instance.applyMoveOnState(state, NuMove(1, 2, null))

        val formula = parser.parse("a")

        val nodes = state.tree

        assertTrue(nodes[4].formula.synEq(formula))
        assertTrue(nodes[4].prefix.equals(listOf(1, 1)))
    }

    @Test
    fun testBasicDiamond() {
        var state = instance.parseFormulaToState("\\sign F: []a | <>a", null)

        state = instance.applyMoveOnState(state, AlphaMove(0, null))
        state = instance.applyMoveOnState(state, PiMove(1, 1, null))
        state = instance.applyMoveOnState(state, NuMove(1, 2, null))

        val formula = parser.parse("a")

        val nodes = state.tree

        assertTrue(nodes[4].formula.synEq(formula))
        assertTrue(nodes[4].prefix.equals(listOf(1, 1)))
    }

    @Test
    fun testWrongSignBox() {
        var state = instance.parseFormulaToState("\\sign F: []a | []a", null)

        state = instance.applyMoveOnState(state, AlphaMove(0, null))
        state = instance.applyMoveOnState(state, PiMove(1, 1, null))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, NuMove(1, 2, null))
        }
    }

    @Test
    fun testWrongSignDiamond() {
        var state = instance.parseFormulaToState("\\sign T: <>a & <>a", null)

        state = instance.applyMoveOnState(state, AlphaMove(0, null))
        state = instance.applyMoveOnState(state, PiMove(1, 1, null))

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, NuMove(1, 2, null))
        }
    }
}
