package kalkulierbar.firstordersequent

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.sequent.AllLeft
import kalkulierbar.sequent.ImpRight
import kalkulierbar.sequent.fo.FirstOrderSequent
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class TestAllLeft {
    val instance = FirstOrderSequent()
    val parser = FirstOrderParser()
    private val instTerm = "a"

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("\\all X: R(X) |-", null)

        state = instance.applyMoveOnState(state, AllLeft(0, 0, instTerm))

        assertTrue(state.tree.size == 2)
        assertTrue(state.tree[0].parent == null)
        assertTrue(state.tree[0].children.size == 1)
        assertTrue(state.tree[0].children[0] == 1)
        assertTrue(state.tree[1].parent == 0)

        val formula1 = parser.parse("\\all X: R(X)")
        val formula2 = parser.parse("R(a)")

        assertTrue(state.tree[1].rightFormulas.size == 0)
        assertTrue(state.tree[1].leftFormulas.size == 2)
        assertTrue(state.tree[1].leftFormulas[0].synEq(formula1))
        assertTrue(state.tree[1].leftFormulas[1].synEq(formula2))
    }

    /**
     * See https://github.com/KalkulierbaR/kalkulierbar/issues/104
     */
    @Test
    fun testComplexTerm() {
        var s = instance.parseFormulaToState("|- \\all X: P(X) -> P(f(a))", null)
        s = instance.applyMoveOnState(s, ImpRight(0, 0))
        s = instance.applyMoveOnState(s, AllLeft(1, 0, "f(a)"))

        assertEquals(3, s.tree.size)
        assertEquals(1, s.tree[1].children.size)
        assertEquals(2, s.tree[1].children[0])
        assertEquals(1, s.tree[2].parent)

        assertEquals(2, s.tree[2].leftFormulas.size)
        assertTrue(s.tree[2].leftFormulas[0].synEq(parser.parse("\\all X: P(X)")))
        assertTrue(s.tree[2].leftFormulas[1].synEq(parser.parse("P(f(a))")))

        assertEquals(1, s.tree[2].rightFormulas.size)
        assertTrue(s.tree[2].rightFormulas[0].synEq(parser.parse("P(f(a))")))
    }

    @Test
    fun testWrongNode() {
        val state = instance.parseFormulaToState("\\ex X: R(X) |-", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, AllLeft(0, 0, instTerm))
        }
    }
}
