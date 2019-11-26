package kalkulierbar.tests

import kalkulierbar.PropositionalTableaux
import kalkulierbar.TableauxNode
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals


class TestPropositionalTableaux {
    val validString = "a,b,!c;!d,e,!f;g"

    @Test
    fun testParseFormulaToState() {
        //Test iff state only contains root
        var parser = PropositionalTableaux()
        var state = parser.parseFormulaToState(validString)
        var root = state.nodes[0]
        assertEquals(state.nodes.size, 1)
        assertEquals(root.parent, 0)
        assertEquals(root.spelling, "true")
        assertEquals(root.negated, false)
    }

}