package kalkulierbar.test.signedtableaux

import kalkulierbar.IllegalMove
import kalkulierbar.logic.*
import kalkulierbar.parsers.ModalLogicParser
import kalkulierbar.signedtableaux.NuMove
import kalkulierbar.signedtableaux.PiMove
import kalkulierbar.signedtableaux.SignedModalTableaux
import kotlin.test.*

class TestPiMove {

    val instance = SignedModalTableaux()
    val parser = ModalLogicParser()

    @Test
    fun testBasicBox() {
        var state = instance.parseFormulaToState("\\sign F: []a", null)

        state = instance.applyMoveOnState(state, PiMove(1, 0, null))

        val formula = parser.parse("a")

        val nodes = state.nodes

        assertTrue(nodes[1].formula.synEq(formula))
        assertTrue(nodes[1].prefix.equals(listOf(1, 1)))
    }

    @Test
    fun testBasicDiamond() {
        var state = instance.parseFormulaToState("\\sign T: <>a", null)

        state = instance.applyMoveOnState(state, PiMove(1, 0, null))

        val formula = parser.parse("a")

        val nodes = state.nodes

        assertTrue(nodes[1].formula.synEq(formula))
        assertTrue(nodes[1].prefix.equals(listOf(1, 1)))
    }

    @Test
    fun testWrongSignBox() {
        var state = instance.parseFormulaToState("\\sign T: []a", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, PiMove(1, 0, null))
        }
    }

    @Test
    fun testWrongSignDiamond() {
        var state = instance.parseFormulaToState("\\sign F: <>a", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, NuMove(1, 0, null))
        }
    }
}
