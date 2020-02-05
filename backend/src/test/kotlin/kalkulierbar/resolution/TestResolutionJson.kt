package kalkulierbar.tests.resolution

import kalkulierbar.JsonParseException
import kalkulierbar.resolution.PropositionalResolution
import kalkulierbar.resolution.ResolutionMove
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
        val json = "{\"c1\": 1, \"c2\": 2, \"spelling\": \"variable\"}"
        val move = instance.jsonToMove(json)
        assertEquals(ResolutionMove(1, 2, "variable"), move)
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveNull() {
        val json = "{\"c1\": 1, \"c2\": null, \"spelling\": null}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveMissingField() {
        val json = "{\"c1\": 4, \"spelling\": \"variable\"}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveTypeMismatch() {
        val json = "{\"c1\": 1, \"c2\": false, \"spelling\": \"variable\"}"
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
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false},{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"highlightSelectable":false,"newestNode":-1,"seal":"7974AE7D1720B6B1D249E035F3AB73422527DD4307F85E8F3D65FB401A76BF3A"}"""
        val state = instance.jsonToState(json)

        assertEquals("resolutionstate|{a, b, c}, {!b, d}, {!c}|false|-1", state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateCorrupt() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a""negated":false}{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"seal":"DA0B67B5A26E5B52D0F0CFEA1ECAD1402CB4B49ED59F4FBCF1C5B7157D1996E3"}"""
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateMissingField() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"negated":false},{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"seal":"DA0B67B5A26E5B52D0F0CFEA1ECAD1402CB4B49ED59F4FBCF1C5B7157D1996E3"}"""
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateModify() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false},{"lit":"c","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"seal":"DA0B67B5A26E5B52D0F0CFEA1ECAD1402CB4B49ED59F4FBCF1C5B7157D1996E3"}"""
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }
}
