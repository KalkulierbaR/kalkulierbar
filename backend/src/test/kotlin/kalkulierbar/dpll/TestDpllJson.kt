package kalkulierbar.dpll

import kalkulierbar.JsonParseException
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestDpllJson {

    private val dpll = DPLL()

    @Test
    fun testJsonParam() {
        dpll.jsonToParam("Hello there, this is a test")
    }

    /*
        Test jsonToMove
     */
    @Test
    fun testJsonMoveValid() {
        var json = "{\"type\":\"dpll-split\",\"branch\":42,\"literal\":\"hello\"}"
        assertEquals(MoveSplit(42, "hello"), dpll.jsonToMove(json))

        json = "{\"type\":\"dpll-prop\",\"branch\":1,\"baseClause\":2,\"propClause\":3,\"propAtom\":4}"
        assertEquals(MovePropagate(1, 2, 3, 4), dpll.jsonToMove(json))

        json = "{\"type\":\"dpll-prune\",\"branch\":-5}"
        assertEquals(MovePrune(-5), dpll.jsonToMove(json))

        json = "{\"type\":\"dpll-modelcheck\",\"branch\":12,\"interpretation\":{\"a\":true,\"b\":false}}"
        assertEquals(MoveModelCheck(12, mapOf("a" to true, "b" to false)), dpll.jsonToMove(json))
    }

    @Test
    fun testJsonMoveInvalid() {
        var json = "{\"type\":\"dpll-split\",\"branch42,\"literal\":\"hello\"}"
        assertFailsWith<JsonParseException> {
            dpll.jsonToMove(json)
        }
        json = "{\"branch\":42,\"literal\":\"hello\"}"
        assertFailsWith<JsonParseException> {
            dpll.jsonToMove(json)
        }
        json = "{\"type\":\"dpll-split\",\"branch\":,\"literal\":\"hello\"}"
        assertFailsWith<JsonParseException> {
            dpll.jsonToMove(json)
        }
        json = "{\"type\":\"dpll-split\",\"literal\":\"hello\"}"
        assertFailsWith<JsonParseException> {
            dpll.jsonToMove(json)
        }
    }

    /*
        Test stateToJson
     */

    @Test
    fun testStateToJson() {
        val expected = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":true},{"lit":"c","negated":false}]},{"atoms":[{"lit":"a","negated":false},{"lit":"c","negated":true}]}]},"tree":[{"parent":null,"type":"ROOT","label":"true","diff":{"type":"cd-identity"},"children":[],"modelVerified":null}],"seal":"9A2C06A4018F47568B0F64B3A9BEA68FE6F83C3CD7E1F45D8B1E925E162E1BA1"}"""
        val got = dpll.parseFormula("!a,c;a,!c", null)
        assertEquals(expected, got)
    }

    /*
        Test jsonToState
     */

    @Test
    fun testJsonToState() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":true},{"lit":"c","negated":false}]},{"atoms":[{"lit":"a","negated":false},{"lit":"c","negated":true}]}]},"tree":[{"parent":null,"type":"ROOT","label":"true","diff":{"type":"cd-identity"},"children":[1,2],"modelVerified":null},{"parent":0,"type":"SPLIT","label":"a","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"a","negated":false}]}},"children":[],"modelVerified":null},{"parent":0,"type":"SPLIT","label":"¬a","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"a","negated":true}]}},"children":[3,4],"modelVerified":null},{"parent":2,"type":"SPLIT","label":"c","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"c","negated":false}]}},"children":[],"modelVerified":null},{"parent":2,"type":"SPLIT","label":"¬c","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"c","negated":true}]}},"children":[],"modelVerified":null}],"seal":"A8651499DDF3E5E9D724CB4E7F35F318FA2559DBE0945B38BCD64A6806D6C1AD"}"""
        val state = dpll.jsonToState(json)
        val expected = "pdpll|{!a, c}, {a, !c}|[(null|[1, 2]|ROOT|true|identity|null), (0|[]|SPLIT|a|add-{a}|null), (0|[3, 4]|SPLIT|¬a|add-{!a}|null), (2|[]|SPLIT|c|add-{c}|null), (2|[]|SPLIT|¬c|add-{!c}|null)]"
        assertEquals(expected, state.getHash())
    }

    @Test
    fun testJsonStateCorrupt() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":true},{"litc","negated":false}]},{"atoms":[{"lit":"a","negated":false},{"lit":"c","negated":true}]}]},"tree":[{"parent":null,"type":"ROOT","label":"true","diff":{"type":"cd-identity"},"children":[1,2],"modelVerified":null},{"parent":0,"type":"SPLIT","label":"a","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"a","negated":false}]}},"children":[],"modelVerified":null},{"parent":0,"type":"SPLIT","label":"¬a","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"a","negated":true}]}},"children":[3,4],"modelVerified":null},{"parent":2,"type":"SPLIT","label":"c","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"c","negated":false}]}},"children":[],"modelVerified":null},{"parent":2,"type":"SPLIT","label":"¬c","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"c","negated":true}]}},"children":[],"modelVerified":null}],"seal":"A8651499DDF3E5E9D724CB4E7F35F318FA2559DBE0945B38BCD64A6806D6C1AD"}"""
        assertFailsWith<JsonParseException> {
            dpll.jsonToState(json)
        }
    }

    @Test
    fun testJsonStateMissingField() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"negated":true},{"lit":"c","negated":false}]},{"atoms":[{"lit":"a","negated":false},{"lit":"c","negated":true}]}]},"tree":[{"parent":null,"type":"ROOT","label":"true","diff":{"type":"cd-identity"},"children":[1,2],"modelVerified":null},{"parent":0,"type":"SPLIT","label":"a","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"a","negated":false}]}},"children":[],"modelVerified":null},{"parent":0,"type":"SPLIT","label":"¬a","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"a","negated":true}]}},"children":[3,4],"modelVerified":null},{"parent":2,"type":"SPLIT","label":"c","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"c","negated":false}]}},"children":[],"modelVerified":null},{"parent":2,"type":"SPLIT","label":"¬c","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"c","negated":true}]}},"children":[],"modelVerified":null}],"seal":"A8651499DDF3E5E9D724CB4E7F35F318FA2559DBE0945B38BCD64A6806D6C1AD"}"""
        assertFailsWith<JsonParseException> {
            dpll.jsonToState(json)
        }
    }

    @Test
    fun testJsonStateModify() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false},{"lit":"c","negated":false}]},{"atoms":[{"lit":"a","negated":false},{"lit":"c","negated":true}]}]},"tree":[{"parent":null,"type":"ROOT","label":"true","diff":{"type":"cd-identity"},"children":[1,2],"modelVerified":null},{"parent":0,"type":"SPLIT","label":"a","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"a","negated":false}]}},"children":[],"modelVerified":null},{"parent":0,"type":"SPLIT","label":"¬a","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"a","negated":true}]}},"children":[3,4],"modelVerified":null},{"parent":2,"type":"SPLIT","label":"c","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"c","negated":false}]}},"children":[],"modelVerified":null},{"parent":2,"type":"SPLIT","label":"¬c","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"c","negated":true}]}},"children":[],"modelVerified":null}],"seal":"A8651499DDF3E5E9D724CB4E7F35F318FA2559DBE0945B38BCD64A6806D6C1AD"}"""
        assertFailsWith<JsonParseException> {
            dpll.jsonToState(json)
        }
    }

    @Test
    fun testJsonStateSeal() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":true},{"lit":"c","negated":false}]},{"atoms":[{"lit":"a","negated":false},{"lit":"c","negated":true}]}]},"tree":[{"parent":null,"type":"ROOT","label":"true","diff":{"type":"cd-identity"},"children":[1,2],"modelVerified":null},{"parent":0,"type":"SPLIT","label":"a","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"a","negated":false}]}},"children":[],"modelVerified":null},{"parent":0,"type":"SPLIT","label":"¬a","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"a","negated":true}]}},"children":[3,4],"modelVerified":null},{"parent":2,"type":"SPLIT","label":"c","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"c","negated":false}]}},"children":[],"modelVerified":null},{"parent":2,"type":"SPLIT","label":"¬c","diff":{"type":"cd-addclause","clause":{"atoms":[{"lit":"c","negated":true}]}},"children":[],"modelVerified":null}],"seal":"A8651499DDF3E5E9D724CB4E7F35F318FAFAFAFADBE0945B38BCD64A6806D6C1AD"}"""
        assertFailsWith<JsonParseException> {
            dpll.jsonToState(json)
        }
    }
}
