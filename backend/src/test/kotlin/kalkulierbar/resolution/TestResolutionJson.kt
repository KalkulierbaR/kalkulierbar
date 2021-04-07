package kalkulierbar.tests.resolution

import kalkulierbar.JsonParseException
import kalkulierbar.parsers.CnfStrategy
import kalkulierbar.resolution.FirstOrderResolution
import kalkulierbar.resolution.FoResolutionParam
import kalkulierbar.resolution.MoveHide
import kalkulierbar.resolution.MoveResolve
import kalkulierbar.resolution.MoveResolveUnify
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
    fun testJsonParamValid() {
        val json = "{\"cnfStrategy\": \"TSEYTIN\", \"visualHelp\": \"NONE\"}"
        val param = instance.jsonToParam(json)
        assertEquals(ResolutionParam(CnfStrategy.TSEYTIN, VisualHelp.NONE), param)
    }

    @Test
    fun testJsonParamCorrupt() {
        val json = "{\"cnfStrategy\": true, \"visualHelp\": \"NONE\"}"
        assertFailsWith<JsonParseException> {
            instance.jsonToParam(json)
        }
    }

    @Test
    fun testJsonFoParamValid() {
        val json = "{\"visualHelp\": \"NONE\"}"
        val param = foInstance.jsonToParam(json)
        assertEquals(FoResolutionParam(VisualHelp.NONE), param)
    }

    @Test
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

        json = "{\"type\":\"res-resolveunify\", \"c1\": 1, \"c2\": 2, \"l1\": 3, \"l2\": 4}"
        assertEquals(MoveResolveUnify(1, 2, 3, 4), instance.jsonToMove(json))
        assertEquals(MoveResolveUnify(1, 2, 3, 4), foInstance.jsonToMove(json))
    }

    @Test
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
    fun testJsonState() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false},{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"visualHelp":"NONE","newestNode":-1,"hiddenClauses":{"clauses":[]},"seal":"C8BB7816176F4DDFE33206C21D4466380D798276E649D48DDA1DD80D48CE9273"}"""
        val state = instance.jsonToState(json)

        assertEquals("resolutionstate|{a, b, c}, {!b, d}, {!c}||NONE|-1", state.getHash())
    }

    @Test
    fun testJsonStateCorrupt() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"anegated":false},{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"visualHelp":"NONE","newestNode":-1,"hiddenClauses":{"clauses":[]},"seal":"C8BB7816176F4DDFE33206C21D4466380D798276E649D48DDA1DD80D48CE9273"}"""
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
    fun testJsonStateMissingField() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{negated":false},{"lit":"b","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"b","negated":true},{"lit":"d","negated":false}]},{"atoms":[{"lit":"c","negated":true}]}]},"visualHelp":"NONE","newestNode":-1,"hiddenClauses":{"clauses":[]},"seal":"C8BB7816176F4DDFE33206C21D4466380D798276E649D48DDA1DD80D48CE9273"}"""
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
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
        val expected = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false}]},{"atoms":[{"lit":"a","negated":true}]}]},"visualHelp":"NONE","newestNode":-1,"hiddenClauses":{"clauses":[]},"lastMove":null,"seal":"C0C4AC36F24D4CE8C65D8108D2E2493D451F005BF5AC1BD00D8E153969952A36"}"""
        val param = "{\"cnfStrategy\": \"NAIVE\", \"visualHelp\": \"NONE\"}"
        val got = instance.parseFormula("a;!a", param)
        assertEquals(expected, got)
    }

    @Test
    fun testJsonToState() {
        val json1 = """{"clauseSet":{"clauses":[{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"b"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"c"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"a"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"QuantifiedVariable","spelling":"X_4"}]}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"Constant","spelling":"a"}]}]},"negated":true},{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"Constant","spelling":"b"}]}]},"negated":true}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"a"}]},"negated":true},{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"b"}]},"negated":true},{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"c"}]},"negated":true}]},{"atoms":[{"lit":{"spelling":"Q","arguments":[{"type":"QuantifiedVariable","spelling":"Y_7"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"Q","arguments":[{"type":"Constant","spelling":"c"}]},"negated":true}]}]},"visualHelp":"HIGHLIGHT","newestNode":-1,"hiddenClauses":{"clauses":[]},"clauseCounter":8,"statusMessage":null,"lastMove":null,"seal":"196976513C2CF3237A499CE786D476733DF97B1199D8C7E26EAB89A210144A7F"}"""
        val json2 = """{"clauseSet":{"clauses":[{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"b"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"c"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"a"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"QuantifiedVariable","spelling":"X_4"}]}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"Constant","spelling":"a"}]}]},"negated":true},{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"Constant","spelling":"b"}]}]},"negated":true}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"a"}]},"negated":true},{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"b"}]},"negated":true},{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"c"}]},"negated":true}]},{"atoms":[{"lit":{"spelling":"Q","arguments":[{"type":"QuantifiedVariable","spelling":"Y_7"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"Q","arguments":[{"type":"Constant","spelling":"c"}]},"negated":true}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"Constant","spelling":"b"}]}]},"negated":true}]},{"atoms":[]},{"atoms":[]}]},"visualHelp":"HIGHLIGHT","newestNode":10,"hiddenClauses":{"clauses":[]},"clauseCounter":11,"statusMessage":null,"lastMove":null,"seal":"73B2B4074EAAD533D36972CFB6AE9BA81AF3E3C492CC09B0D86125EBB6C4723F"}"""
        val jsonInvalid1 = """{"clauseSet":{"clauses":[{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"b"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"c"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"a"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"QuantifiedVariable","spelling":"X_4"}]}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"Constant","spelling":"a"}]}]},"negated":true},{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"Constant","spelling":"b"}]}]},"negated":true}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"a"}]},"negated":true},{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"b"}]},"negated":true},{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"c"}]},"negated":true}]},{"atoms":[{"lit":{"spelling":"Q","arguments":[{"type":"QuantifiedVariable","spelling":"Y_7"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"Q","arguments":[{"type":"Constant","spelling":"c"}]},"negated":true}]}]},"visualHelp":"HIGHLIGHT","newestNode":-1,"hiddenClauses":{"clauses":[]},"clauseCounter":8,"statusMessage":null,"lastMove":null,"seal":"196976513C2CF3237A499CE786D4HELLODF97B1199D8C7E26EAB89A210144A7F"}"""
        val jsonInvalid2 = """{"clauseSet":{"clauses":[{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"b"}]},false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"c"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"a"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"QuantifiedVariable","spelling":"X_4"}]}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"Constant","spelling":"a"}]}]},"negated":true},{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"Constant","spelling":"b"}]}]},"negated":true}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"a"}]},"negated":true},{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"b"}]},"negated":true},{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"c"}]},"negated":true}]},{"atoms":[{"lit":{"spelling":"Q","arguments":[{"type":"QuantifiedVariable","spelling":"Y_7"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"Q","arguments":[{"type":"Constant","spelling":"c"}]},"negated":true}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Function","spelling":"f","arguments":[{"type":"Constant","spelling":"b"},{"type":"Constant","spelling":"b"}]}]},"negated":true}]},{"atoms":[]},{"atoms":[]}]},"visualHelp":"HIGHLIGHT","newestNode":10,"hiddenClauses":{"clauses":[]},"clauseCounter":11,"statusMessage":null,"lastMove":null,"seal":"73B2B4074EAAD533D36972CFB6AE9BA81AF3E3C492CC09B0D86125EBB6C4723F"}"""
        val state1 = foInstance.jsonToState(json1)
        val state2 = foInstance.jsonToState(json2)
        assertEquals(json1, foInstance.stateToJson(state1))
        assertEquals(json2, foInstance.stateToJson(state2))
        assertFailsWith<JsonParseException> {
            foInstance.jsonToState(jsonInvalid1)
        }
        assertFailsWith<JsonParseException> {
            foInstance.jsonToState(jsonInvalid2)
        }
    }
}
