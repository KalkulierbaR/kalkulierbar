package kalkulierbar.nonclausaltableaux

import kotlin.test.Test
import kotlin.test.assertEquals

class TestUndo {

    val instance = NonClausalTableaux()

    @Test
    fun testBasicMoves() {
        val formula = "(/all X: (P(X) & R(c))) | (/ex X: Q(X))"
        val history = mutableListOf<String>()

        var state = instance.parseFormula(formula, null)

        // Set usedBacktracking flag
        state = instance.applyMove(state, """{type: "beta", leafID: 0}""")
        state = instance.applyMove(state, """{type: "undo"}""")

        history.add(state)
        state = instance.applyMove(state, """{type: "beta", leafID: 0}""")
        history.add(state)
        state = instance.applyMove(state, """{type: "gamma", leafID: 2}""")
        history.add(state)
        state = instance.applyMove(state, """{type: "delta", leafID: 1}""")
        history.add(state)
        state = instance.applyMove(state, """{type: "alpha", leafID: 3}""")

        state = instance.applyMove(state, """{type: "undo"}""")
        assertEquals(history.removeAt(history.size - 1), state)
        state = instance.applyMove(state, """{type: "undo"}""")
        assertEquals(history.removeAt(history.size - 1), state)
        state = instance.applyMove(state, """{type: "undo"}""")
        assertEquals(history.removeAt(history.size - 1), state)
        state = instance.applyMove(state, """{type: "undo"}""")
        assertEquals(history[0], state)
        state = instance.applyMove(state, """{type: "undo"}""")
        assertEquals(history[0], state)
        state = instance.applyMove(state, """{type: "undo"}""")
        assertEquals(history[0], state)
    }
}
