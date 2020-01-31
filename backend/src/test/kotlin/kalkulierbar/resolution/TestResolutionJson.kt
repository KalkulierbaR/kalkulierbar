package kalkulierbar.tests.resolution

import kalkulierbar.JsonParseException
import kalkulierbar.resolution.MoveResolve
import kalkulierbar.resolution.PropositionalResolution
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestResolutionJson {

    val instance = PropositionalResolution()

    /*
        Test jsonToMove
    */

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveValid() {
        val json = "{\"type\":\"res-resolve\",\"c1\": 1, \"c2\": 2, \"literal\": \"variable\"}"
        val move = instance.jsonToMove(json)
        assertEquals(MoveResolve(1, 2, "variable"), move)
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveNull() {
        val json = "{\"type\":\"res-resolve\",\"c1\": 1, \"c2\": null, \"spelling\": null}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveMissingField() {
        val json = "{\"type\":\"res-resolve\",\"c1\": 4, \"spelling\": \"variable\"}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveTypeMismatch() {
        val json = "{\"type\":\"res-resolve\",\"c1\": 1, \"c2\": false, \"spelling\": \"variable\"}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
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
}
