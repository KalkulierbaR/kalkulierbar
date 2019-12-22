package kalkulierbar.tests

import kalkulierbar.JsonParseException
import kalkulierbar.tableaux.PropositionalTableaux
// import kalkulierbar.tableaux.TableauxMove
import kalkulierbar.tableaux.TableauxParam
import kalkulierbar.tableaux.TableauxType
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestPropositionalJson {

    val instance = PropositionalTableaux()

    /*
        Test jsonToMove
    */

    /*
    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveValid() {
        val json = "{\"type\": \"j\", \"id1\": 0, \"id2\": 1}"
        val move = instance.jsonToMove(json)
        assertEquals(TableauxMove("j", 0, 1), move)
    }
    */

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveNull() {
        val json = "{\"type\": \"j\", \"id1\": 0, \"id2\": null}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveMissingField() {
        val json = "{\"type\": \"j\", \"id2\": 42}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonMoveTypeMismatch() {
        val json = "{\"type\": \"j\", \"id2\": \"dream\"}"
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
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false},{"lit":"b","negated":false}]},{"atoms":[{"lit":"a","negated":true}]},{"atoms":[{"lit":"b","negated":true}]}]},"type":"UNCONNECTED","regular":false,"nodes":[{"parent":null,"spelling":"true","negated":false,"isClosed":false,"closeRef":null,"children":[]}],"seal":"91BFFF163A60964368A4BE7C5427C89EA73D3DDFB89C0FC5CE6005EF53E150FA"}"""
        val state = instance.jsonToState(json)
        assertEquals("tableauxstate|UNCONNECTED|false|{a, b}, {!a}, {!b}|[true;p;null;-;l;o;()]", state.getHash())
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateCorrupt() {
        val json = """{"type":"UNCONNECTED","regular":,"nodes":[{"parent":null,"spelling":"true","negated":false,"isClosed":false,"closeRef":null,"children":[]}],"seal":"91BFFF163A60964368A4BE7C5427C89EA73D3DDFB89C0FC5CE6005EF53E150FA"}"""

        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateMissingField() {
        val json = """{"type":"UNCONNECTED","regular":false,"nodes":[{"parent":null,"spelling":"true","negated":false,"isClosed":false,"closeRef":null,"children":[]}],"seal":"91BFFF163A60964368A4BE7C5427C89EA73D3DDFB89C0FC5CE6005EF53E150FA"}"""

        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateModify() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false},{"lit":"b","negated":false}]},{"atoms":[{"lit":"b","negated":true}]}]},{"atoms":[{"lit":"a","negated":true}]},"type":"UNCONNECTED","regular":false,"nodes":[{"parent":null,"spelling":"true","negated":false,"isClosed":false,"closeRef":null,"children":[]}],"seal":"91BFFF163A60964368A4BE7C5427C89EA73D3DDFB89C0FC5CE6005EF53E150FA"}"""
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonStateTypeMismatch() {
        val json = """{"clauseSet":{"clauses":[{"atoms":[{"lit":3,"negated":false},{"lit":"b","negated":true}]},{"atoms":[{"lit":"a","negated":true}]},{"atoms":[{"lit":"b","negated":true}]}]},"type":"UNCONNECTED","regular":false,"nodes":[{"parent":null,"spelling":"true","negated":false,"isClosed":false,"closeRef":null,"children":[]}],"seal":"91BFFF163A60964368A4BE7C5427C89EA73D3DDFB89C0FC5CE6005EF53E150FA"}"""

        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    /*
        Test jsonToParam
    */

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonParamValid() {
        val json = "{\"type\": \"UNCONNECTED\", \"regular\": false}"
        val param = instance.jsonToParam(json)
        assertEquals(TableauxParam(TableauxType.UNCONNECTED, false), param)
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonParamNull() {
        val json = "{\"type\": \"WEAKLYCONNECTED\", \"regular\": null}"
        assertFailsWith<JsonParseException> {
            instance.jsonToParam(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonParamMissingField() {
        val json = "{\"type\": \"STRONGLYCONNECTED\"}"
        assertFailsWith<JsonParseException> {
            instance.jsonToParam(json)
        }
    }

    @Test
    @kotlinx.serialization.UnstableDefault
    fun testJsonParamTypeMismatch() {
        val json = "{\"type\": \"42\", \"regular\": false}"
        assertFailsWith<JsonParseException> {
            instance.jsonToParam(json)
        }
    }
}
