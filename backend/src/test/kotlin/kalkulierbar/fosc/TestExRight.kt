package kalkulierbar.fosc

import kalkulierbar.IllegalMove
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.sequentCalculus.fosc.FOSC
import kalkulierbar.sequentCalculus.*
import kotlin.test.*

class TestExRight {
    val instance = FOSC()
    val parser = FirstOrderParser()
    val varAssign = mapOf("X" to "a")

    @Test
    fun testBasic() {
        var state = instance.parseFormulaToState("\\ex X: R(X)", null)

        state = instance.applyMoveOnState(state, ExRight(0, 0, varAssign));

        assertTrue(state.tree.size == 2);
        assertTrue(state.tree[0].parent == null);
        assertTrue(state.tree[0].children.size == 1);
        assertTrue(state.tree[0].children[0] == 1);
        assertTrue(state.tree[1].parent == 0);

        val formula1 = parser.parse("\\ex X: R(X)");
        val formula2 = parser.parse("R(a)");

        assertTrue(state.tree[1].leftFormulas.size == 0);
        assertTrue(state.tree[1].rightFormulas.size == 2);
        assertTrue(state.tree[1].rightFormulas[0].synEq(formula1));
        assertTrue(state.tree[1].rightFormulas[1].synEq(formula2));
    }

    @Test
    fun testWrongNode() {
        var state = instance.parseFormulaToState("\\all X: R(X)", null)

        assertFailsWith<IllegalMove> {
            instance.applyMoveOnState(state, AllLeft(0,0, varAssign))
        }
    }
    
}
