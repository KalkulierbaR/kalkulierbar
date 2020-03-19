package kalkulierbar.tests.tableaux

import kalkulierbar.JsonParseException
import kalkulierbar.tableaux.FirstOrderTableaux
import kalkulierbar.tableaux.FoTableauxParam
import kalkulierbar.tableaux.MoveExpand
import kalkulierbar.tableaux.TableauxType
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestFirstOrderJson {

    val instance = FirstOrderTableaux()

    /*
        Test jsonToMove
    */

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveValid() {
        val json = "{\"type\": \"tableaux-expand\", \"id1\": 0, \"id2\": 42}"
        val move = instance.jsonToMove(json)
        assertEquals(MoveExpand(0, 42), move)
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveNull() {
        val json = "{\"type\": \"tableaux-expand\", \"id1\": 0, \"id2\": null}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveMissingField() {
        val json = "{\"type\": \"tableaux-expand\", \"id2\": 42, \"varAssign\":{}}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveTypeMismatch() {
        val json = "{\"type\": \"tableaux-expand\", \"id2\": \"dream\", \"varAssign\":{}}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }
    }

    /*
        Test jsonToState
    */

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateEmpty() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"QuantifiedVariable","spelling":"X"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"c"}]},"negated":true}]}]},"formula":"\\all X: R(X) & !R(c)","type":"UNCONNECTED","regular":false,"backtracking":false,"manualVarAssign":false,"nodes":[{"parent":null,"relation":{"spelling":"true","arguments":[]},"negated":false,"isClosed":false,"closeRef":null,"children":[],"spelling":"true()"}],"moveHistory":[],"usedBacktracking":false,"expansionCounter":0,"seal":"47E0E51B486CDF0FEB644B195CFBCB08E61C2556BD67D84B86B08CB658055ACB","renderedClauseSet":["R(X)","!R(c)"]}"""
        val state = instance.jsonToState(json)
        val hash = "fotableaux|\\all X: R(X) & !R(c)|0|UNCONNECTED|false|false|false|false|{R(X)}, {!R(c)}|[true();p;null;-;o;()]|[]"
        assertEquals(hash, state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateModification() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"QuantifiedVariable","spelling":"X"}]},"negated":false}]},{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"q"}]},"negated":true}]}]},"formula":"\\all X: R(X) & !R(c)","type":"UNCONNECTED","regular":false,"backtracking":false,"manualVarAssign":false,"nodes":[{"parent":null,"relation":{"spelling":"true","arguments":[]},"negated":false,"isClosed":false,"closeRef":null,"children":[],"spelling":"true()"}],"moveHistory":[],"usedBacktracking":false,"expansionCounter":0,"seal":"47E0E51B486CDF0FEB644B195CFBCB08E61C2556BD67D84B86B08CB658055ACB","renderedClauseSet":["R(X)","!R(c)"]}"""
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    /*
        Test stateToJson
    */

    @Test
    fun testStateToJson() {
        val json = instance.parseFormula("\\ex X: R(X)", null)
        val expected = """{"clauseSet":{"clauses":[{"atoms":[{"lit":{"spelling":"R","arguments":[{"type":"Constant","spelling":"sk1"}]},"negated":false}]}]},"formula":"\\ex X: R(X)","type":"UNCONNECTED","regular":false,"backtracking":false,"manualVarAssign":false,"nodes":[{"parent":null,"relation":{"spelling":"true","arguments":[]},"negated":false,"lemmaSource":null,"isClosed":false,"closeRef":null,"children":[],"spelling":"true()"}],"moveHistory":[],"usedBacktracking":false,"expansionCounter":0,"seal":"22B8CEDC626EBF36DAAA3E50356CD328C075805A0538EA0F91B4C88658D8C465","renderedClauseSet":["R(sk1)"]}"""
        assertEquals(expected, json)
    }

    /*
        Test jsonToParam
    */

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonParamValid() {
        val json = "{\"type\": \"UNCONNECTED\", \"regular\": false, \"backtracking\": false, \"manualVarAssign\": true}"
        val param = instance.jsonToParam(json)
        assertEquals(FoTableauxParam(TableauxType.UNCONNECTED, false, false, true), param)
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonParamInvalid() {
        val json = "{\"type\": \"WEAKLYCONNECTED\", \"regular\": null, \"backtracking\": false, \"manualVarAssign\": true}"
        assertFailsWith<JsonParseException> {
            instance.jsonToParam(json)
        }
    }
}
