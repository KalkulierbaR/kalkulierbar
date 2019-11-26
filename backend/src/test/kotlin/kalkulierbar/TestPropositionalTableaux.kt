package kalkulierbar.tests

import kalkulierbar.PropositionalTableaux
import kalkulierbar.TableauxNode
import kotlin.test.assertEquals
import org.junit.jupiter.api.Test

class TestPropositionalTableaux {

    val instance = PropositionalTableaux()

    @Test
    fun testCheckCloseSimple() {
        var state = instance.parseFormulaToState("a,!a")

        assertEquals(false, instance.checkCloseOnState(state))

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(1, "a", true)
            )

        state.nodes.addAll(nodes)
        state.nodes.get(0).children.add(1)
        state.nodes.get(1).children.add(2)

        assertEquals(false, instance.checkCloseOnState(state))

        // Now close the proof
        val a = state.nodes.get(2)

        a.closeRef = 1
        a.isClosed = true

        assertEquals(true, instance.checkCloseOnState(state))
    }

    @Test
    fun testCheckClose() {
        var state = instance.parseFormulaToState("a,b;!a,!b")

        assertEquals(false, instance.checkCloseOnState(state))

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(0, "b", false),
            TableauxNode(1, "a", true),
            TableauxNode(2, "b", true)
            )

        state.nodes.addAll(nodes)
        state.nodes.get(0).children.add(1)
        state.nodes.get(0).children.add(2)
        state.nodes.get(1).children.add(3)
        state.nodes.get(2).children.add(4)

        assertEquals(false, instance.checkCloseOnState(state))

        // Now close the proof
        val a = state.nodes.get(3)
        val b = state.nodes.get(4)

        a.closeRef = 1
        b.closeRef = 2
        a.isClosed = true
        b.isClosed = true

        assertEquals(true, instance.checkCloseOnState(state))
    }

    @Test
    fun testCheckCloseIncorrectState() {
        var state = instance.parseFormulaToState("a,b;!a,!b")

        state.nodes.add(TableauxNode(0, "a", true))
        state.nodes.get(0).children.add(1)

        assertEquals(false, instance.checkCloseOnState(state))

        // Just mark the leaf as closed without doing anything
        state.nodes.get(1).isClosed = true

        assertEquals(false, instance.checkCloseOnState(state))

        // Set a closeRef, too
        state.nodes.get(1).closeRef = 0

        assertEquals(false, instance.checkCloseOnState(state))

        // Set the closeRef to itself
        state.nodes.get(1).closeRef = 1

        assertEquals(false, instance.checkCloseOnState(state))
    }

    @Test
    fun testCheckCloseIncorrectState2() {
        var state = instance.parseFormulaToState("a,!a")

        val nodes = listOf(
            TableauxNode(0, "a", false),
            TableauxNode(1, "a", true)
            )

        state.nodes.addAll(nodes)
        state.nodes.get(0).children.add(1)
        state.nodes.get(1).children.add(2)

        // Don't close proof completely
        state.nodes.get(2).closeRef = 1

        assertEquals(false, instance.checkCloseOnState(state))
    }
}
