package kalkulierbar.tableaux

import kalkulierbar.JsonParseException
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestPropositionalJson {
    val instance = PropositionalTableaux()

    /*
        Test jsonToMove
     */

    @Test
    fun testJsonMoveValid() {
        val json = "{\"type\": \"tableaux-close\", \"id1\": 0, \"id2\": 12}"
        val move = instance.jsonToMove(json)
        assertEquals(MoveAutoClose(0, 12), move)
    }

    @Test
    fun testJsonMoveNull() {
        val json = "{\"type\": \"tableaux-close\", \"id1\": 0, \"id2\": null}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }
    }

    @Test
    fun testJsonMoveMissingField() {
        val json = "{\"type\": \"tableaux-expand\", \"id2\": 42}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }
    }

    @Test
    fun testJsonMoveTypeMismatch() {
        val json = "{\"type\": \"tableaux-expand\", \"id2\": \"dream\"}"
        assertFailsWith<JsonParseException> {
            instance.jsonToMove(json)
        }
    }

    /*
        Test jsonToState
     */

    @Test
    fun testJsonStateEmpty() {
        val json =
            """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false},
                |{"lit":"b","negated":false}]},{"atoms":[{"lit":"a","negated":true}]},
                |{"atoms":[{"lit":"b","negated":true}]}]},
                |"type":"UNCONNECTED","regular":false,"backtracking":false,
                |"tree":[{"parent":null,"spelling":"true","negated":false,
                |"isClosed":false,"closeRef":null,"children":[]}],"moveHistory":[],
                |"backtracking":false,
                |"seal":"9FB4C2B77422E91BAEB40529CEEBB8660F54A2DA64E0E27BAAFD41E61819D9A1"}
            """.trimMargin()
        val state = instance.jsonToState(json)
        assertEquals(
            "tableauxstate|UNCONNECTED|false|false|false|{a, b}, {!a}, {!b}|" +
                "[true;p;null;-;l;o;()]|[]",
            state.getHash(),
        )
    }

    @Test
    fun testJsonStateCorrupt() {
        val json =
            """{"clauseSet":{"clauses":"atoms":[{"lit":"a","negated":false},
                |{"lit":"b","negated":false}]},{"atoms":[{"lit":"a","negated":true}]},
                |{"atoms":[{"lit":"b","negated":true}]}]},"type":"UNCONNECTED",
                |"regular":false,"backtracking":false,"tree":
                |[{"parent":null,"spelling":"true","negated":false,
                |"isClosed":false,"closeRef":null,"children":[]}],"moveHistory":[],
                |"backtracking":false,
                |"seal":"9FB4C2B77422E91BAEB40529CEEBB8660F54A2DA64E0E27BAAFD41E61819D9A1"}
            """.trimMargin()

        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
    fun testJsonStateMissingField() {
        val json =
            """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false},
                |{negated":false}]},{"atoms":[{"lit":"a","negated":true}]},
                |{"atoms":[{"lit":"b","negated":true}]}]},"type":"UNCONNECTED",
                |"regular":false,"backtracking":false,"tree":
                |[{"parent":null,"spelling":"true","negated":false,
                |"isClosed":false,"closeRef":null,"children":[]}],
                |"moveHistory":[],"backtracking":false,
                |"seal":"9FB4C2B77422E91BAEB40529CEEBB8660F54A2DA64E0E27BAAFD41E61819D9A1"}
            """.trimMargin()

        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
    fun testJsonStateModify() {
        val json =
            """{"clauseSet":{"clauses":[{"atoms":[{"lit":"a","negated":false}
                |,{"lit":"c","negated":false}]},{"atoms":[{"lit":"a","negated":true}]},
                |{"atoms":[{"lit":"b","negated":true}]}]},"type":"UNCONNECTED","regular":false,
                |"backtracking":false,"tree":[{"parent":null,"spelling":"true","negated":false,
                |"isClosed":false,"closeRef":null,"children":[]}],"moveHistory":[],
                |"backtracking":false,
                |"seal":"9FB4C2B77422E91BAEB40529CEEBB8660F54A2DA64E0E27BAAFD41E61819D9A1"}
            """.trimMargin()
        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    @Test
    fun testJsonStateTypeMismatch() {
        val json =
            """{"clauseSet":{"clauses":[{"atoms":[{"lit":3,"negated":false},
                |{"lit":"b","negated":false}]},{"atoms":[{"lit":"a","negated":true}]},
                |{"atoms":[{"lit":"b","negated":true}]}]},"type":"UNCONNECTED","regular":false,
                |"backtracking":false,"tree":[{"parent":null,"spelling":"true","negated":false,
                |"isClosed":false,"closeRef":null,"children":[]}],"moveHistory":[],
                |"backtracking":false,
                |"seal":"9FB4C2B77422E91BAEB40529CEEBB8660F54A2DA64E0E27BAAFD41E61819D9A1"}
            """.trimMargin()

        assertFailsWith<JsonParseException> {
            instance.jsonToState(json)
        }
    }

    /*
        Test jsonToParam
     */

    @Test
    fun testJsonParamValid() {
        val json = "{\"type\": \"UNCONNECTED\", \"regular\": false, \"backtracking\": false}"
        val param = instance.jsonToParam(json)
        assertEquals(TableauxParam(TableauxType.UNCONNECTED, regular = false, backtracking = false), param)
    }

    @Test
    fun testJsonParamNull() {
        val json = "{\"type\": \"WEAKLYCONNECTED\", \"regular\": null, \"backtracking\": false}"
        assertFailsWith<JsonParseException> {
            instance.jsonToParam(json)
        }
    }

    @Test
    fun testJsonParamMissingField() {
        val json = "{\"type\": \"STRONGLYCONNECTED\"}"
        assertFailsWith<JsonParseException> {
            instance.jsonToParam(json)
        }
    }

    @Test
    fun testJsonParamTypeMismatch() {
        val json = "{\"type\": \"42\", \"regular\": false, \"backtracking\": false}"
        assertFailsWith<JsonParseException> {
            instance.jsonToParam(json)
        }
    }
}
