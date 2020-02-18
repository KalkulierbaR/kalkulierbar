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
import kalkulierbar.resolution.VisualHelp
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
        val json = "{\"cnfStrategy\": \"TSEYTIN\", \"visualHelp\": \"NONE\"}"
        val param = instance.jsonToParam(json)
        assertEquals(ResolutionParam(CnfStrategy.TSEYTIN, VisualHelp.NONE), param)
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonParamCorrupt() {
        val json = "{\"cnfStrategy\": true, \"visualHelp\": \"NONE\"}"
        assertFailsWith<JsonParseException> {
            instance.jsonToParam(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonFoParamValid() {
        val json = "{\"visualHelp\": \"NONE\"}"
        val param = foInstance.jsonToParam(json)
        assertEquals(FoResolutionParam(VisualHelp.NONE), param)
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonFoParamCorrupt() {
        val json = "{\"visualHelp\": \"maybe\"}"
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
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false},{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"visualHelp":"NONE","newestNode":-1,"hiddenClauses":{"clauses":[]},"seal":"C8BB7816176F4DDFE33206C21D4466380D798276E649D48DDA1DD80D48CE9273"}"""
        val state = instance.jsonToState(json)

        assertEquals("resolutionstate|{a, b, c}, {!b, d}, {!c}||NONE|-1", state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateCorrupt() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"anegated":false},{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"visualHelp":"NONE","newestNode":-1,"hiddenClauses":{"clauses":[]},"seal":"C8BB7816176F4DDFE33206C21D4466380D798276E649D48DDA1DD80D48CE9273"}"""
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateMissingField() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{negated":false},{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"visualHelp":"NONE","newestNode":-1,"hiddenClauses":{"clauses":[]},"seal":"C8BB7816176F4DDFE33206C21D4466380D798276E649D48DDA1DD80D48CE9273"}"""
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateModify() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":true},{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"visualHelp":"NONE","newestNode":-1,"hiddenClauses":{"clauses":[]},"seal":"C8BB7816176F4DDFE33206C21D4466380D798276E649D48DDA1DD80D48CE9273"}"""
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    /*
        Test stateToJson
    */

    @Test
    fun testStateToJson() {
        val expected = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false}]},{"atoms":[{"lit":"a","negated":true}]}]},"visualHelp":"NONE","newestNode":-1,"hiddenClauses":{"clauses":[]},"seal":"C0C4AC36F24D4CE8C65D8108D2E2493D451F005BF5AC1BD00D8E153969952A36"}"""
        val param = "{\"cnfStrategy\": \"NAIVE\", \"visualHelp\": \"NONE\"}"
        val got = instance.parseFormula("a;!a", param)
        assertEquals(expected, got)
    }
}
