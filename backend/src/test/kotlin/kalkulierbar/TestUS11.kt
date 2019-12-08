
package kalkulierbar.tests

import kalkulierbar.tableaux.PropositionalTableaux
import kalkulierbar.tableaux.TableauxNode
import kalkulierbar.tableaux.TableauxState
// import kotlin.test.assertEquals

class TestUS11 {

    val instance = PropositionalTableaux()

    // State creation helper function
    private fun createArtificialState(nodes: List<TableauxNode>, state: TableauxState): TableauxState {
        state.nodes.addAll(nodes)

        for (i in nodes.indices)
            state.nodes[nodes[i].parent!!].children.add(i + 1)

        return state
    }

    /*
        Test checkRegularity
    */

    /*fun testRegularityValidA() {
        var state = instance.parseFormulaToState("a,b,c;!b;!c;a,b;!a,b;c;a")

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(0, "b", false),
            TableauxNode(0, "c", false),
            TableauxNode(1, "a", true),
            TableauxNode(1, "b", false),
            TableauxNode(2, "c", false),
            TableauxNode(6, "a", false),
            TableauxNode(3, "a", false),
            TableauxNode(3, "b", false),
            TableauxNode(8, "c", true),
            TableauxNode(9, "b", true)
        )
        state = createArtificialState(nodes, state)

        assertEquals(true, instance.checkRegularity(state))
    }

    fun testRegularityInalidA() {
        var state = instance.parseFormulaToState("a,b;a")

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(0, "b", false),
            TableauxNode(1, "a", false)
        )
        state = createArtificialState(nodes, state)

        assertEquals(false, instance.checkRegularity(state))
    }

    fun testRegularityInalidB() {
        var state = instance.parseFormulaToState("a;b;c")

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(1, "b", false),
            TableauxNode(2, "c", false),
            TableauxNode(3, "a", false),
            TableauxNode(4, "c", true)
        )
        state = createArtificialState(nodes, state)

        assertEquals(false, instance.checkRegularity(state))
    }

    fun testRegularityInalidC() {
        var state = instance.parseFormulaToState("a;!a")

        val nodes = listOf(
            TableauxNode(0, "a", true),
            TableauxNode(1, "a", false),
            TableauxNode(2, "a", true)
        )
        state = createArtificialState(nodes, state)

        assertEquals(false, instance.checkRegularity(state))
    }*/
}
