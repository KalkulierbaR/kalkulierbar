package kalkulierbar.tests.resolution

import kalkulierbar.JsonParseException
import kalkulierbar.parsers.CnfStrategy
import kalkulierbar.resolution.FirstOrderResolution
import kalkulierbar.resolution.FoResolutionParam
import kalkulierbar.resolution.MoveHide
import kalkulierbar.resolution.MoveInstantiate
import kalkulierbar.resolution.MoveResolve
import kalkulierbar.resolution.MoveShow
import kalkulierbar.resolution.PropositionalResolution
import kalkulierbar.resolution.ResolutionParam
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestResolutionJson {

    val instance = PropositionalResolution()
    val foInstance = FirstOrderResolution()

    /*
        Test jsonToParam
    */

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonParamValid() {
        val json = "{\"cnfStrategy\": \"TSEYTIN\", \"highlightSelectable\": true}"
        val param = instance.jsonToParam(json)
        assertEquals(ResolutionParam(CnfStrategy.TSEYTIN, true), param)
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonParamCorrupt() {
        val json = "{\"cnfStrategy\": true, \"highlightSelectable\": true}"
        assertFailsWith<JsonParseException> {
            instance.jsonToParam(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonFoParamValid() {
        val json = "{\"highlightSelectable\": true}"
        val param = foInstance.jsonToParam(json)
        assertEquals(FoResolutionParam(true), param)
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonFoParamCorrupt() {
        val json = "{\"highlightSelectable\": \"maybe\"}"
        assertFailsWith<JsonParseException> {
            foInstance.jsonToParam(json)
        }
    }

    /*
        Test jsonToMove
    */

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveValid() {
        var json = "{\"type\":\"res-resolve\",\"c1\": 1, \"c2\": 2, \"literal\": \"variable\"}"
        assertEquals(MoveResolve(1, 2, "variable"), instance.jsonToMove(json))
        assertEquals(MoveResolve(1, 2, "variable"), foInstance.jsonToMove(json))

        json = "{\"type\":\"res-hide\",\"c1\": 1}"
        assertEquals(MoveHide(1), instance.jsonToMove(json))
        assertEquals(MoveHide(1), foInstance.jsonToMove(json))

        json = "{\"type\":\"res-show\"}"
        assert(instance.jsonToMove(json) is MoveShow)
        assert(foInstance.jsonToMove(json) is MoveShow)

        json = "{\"type\":\"res-instantiate\", \"c1\": 1, \"varAssign\": {\"X\": \"c\"}}"
        assertEquals(MoveInstantiate(1, mapOf("X" to "c")), instance.jsonToMove(json))
        assertEquals(MoveInstantiate(1, mapOf("X" to "c")), foInstance.jsonToMove(json))
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveNull() {
        val json = "{\"type\":\"res-resolve\",\"c1\": 1, \"c2\": null, \"spelling\": null}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }

        assertFailsWith<JsonParseException> {
            foInstance.jsonToMove(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveMissingField() {
        val json = "{\"type\":\"res-resolve\",\"c1\": 4, \"spelling\": \"variable\"}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }

        assertFailsWith<JsonParseException> {
            foInstance.jsonToMove(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveTypeMismatch() {
        val json = "{\"type\":\"res-resolve\",\"c1\": 1, \"c2\": false, \"spelling\": \"variable\"}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }

        assertFailsWith<JsonParseException> {
            foInstance.jsonToMove(json)
        }
    }

    /*
        Test jsonToState
    */

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonState() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false},{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"highlightSelectable":false,"newestNode":-1,"hiddenClauses":{"clauses":[]},"seal":"E0C05A7FA9314F20A57557E5F0E5C080263A94A1F1B7C1A25AE47FA86DB9F2A3"}"""
        val state = instance.jsonToState(json)

        assertEquals("resolutionstate|{a, b, c}, {!b, d}, {!c}||false|-1", state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateCorrupt() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"anegated":false},{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"highlightSelectable":false,"newestNode":-1,"hiddenClauses":{"clauses":[]},"seal":"E0C05A7FA9314F20A57557E5F0E5C080263A94A1F1B7C1A25AE47FA86DB9F2A3"}"""
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateMissingField() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{negated":false},{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"highlightSelectable":false,"newestNode":-1,"hiddenClauses":{"clauses":[]},"seal":"E0C05A7FA9314F20A57557E5F0E5C080263A94A1F1B7C1A25AE47FA86DB9F2A3"}"""
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateModify() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":true},{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"highlightSelectable":false,"newestNode":-1,"hiddenClauses":{"clauses":[]},"seal":"E0C05A7FA9314F20A57557E5F0E5C080263A94A1F1B7C1A25AE47FA86DB9F2A3"}"""
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    /*
        Test stateToJson
    */

    @Test
    fun testStateToJson() {
        val expected = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false}]},{"atoms":[{"lit":"a","negated":true}]}]},"highlightSelectable":true,"newestNode":-1,"hiddenClauses":{"clauses":[]},"seal":"E4B7A88793E5897F47811DB24F7C16DC87E6C9280CA873C293A28D824DB1BA22"}"""
        val param = "{\"cnfStrategy\": \"NAIVE\", \"highlightSelectable\": true}"
        val got = instance.parseFormula("a;!a", param)
        assertEquals(expected, got)
    }
}
