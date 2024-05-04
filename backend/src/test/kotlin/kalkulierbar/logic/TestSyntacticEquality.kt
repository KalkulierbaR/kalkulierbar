package kalkulierbar.logic

import kalkulierbar.clause.Atom
import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals

class TestSyntacticEquality {

    private val equalPairs = listOf(
        Pair("f(g(f(q, a)), c)", "f(g(f(q, a)), c)"),
        Pair("a", "a"),
        Pair("f(X)", "f(X)"),
    )

    private val unequalPairs = listOf(
        Pair("f(g(f(q, a)), c)", "f(g(f(q, a)), d)"),
        Pair("a", "d"),
        Pair("f(X, Y)", "f(X, X)"),
        Pair("f(g(f(c)))", "f(g(f(g(c))))"),
        Pair("X", "Y"),
        Pair("X", "x"),
    )

    @Test
    fun testAtomStringEquality() {
        val a = Atom("a", false)
        val b = Atom("b", false)
        val c = Atom("a", true)
        val d = Atom("a", false)

        assertEquals(a, d)
        assertNotEquals(a, b)
        assertNotEquals(a, c)
    }

    @Test
    fun testAtomRelationEquality() {
        val a = Atom(Relation("R", listOf<FirstOrderTerm>(Constant("c1"))), false)
        val b = Atom(Relation("R", listOf<FirstOrderTerm>(Constant("c2"))), false)
        val c = Atom(Relation("Q", listOf<FirstOrderTerm>(Constant("c1"))), false)
        val d = Atom(Relation("R", listOf<FirstOrderTerm>(Constant("c1"))), false)

        assertEquals(a, d)
        assertNotEquals(a, b)
        assertNotEquals(a, c)
    }

    @Test
    fun testEqualTerms() {
        for ((a, b) in equalPairs) {
            val parsedA = FirstOrderParser.parseTerm(a)
            val parsedB = FirstOrderParser.parseTerm(b)

            assert(parsedA.synEq(parsedB))
        }
    }

    @Test
    fun testUnequalTerms() {
        for ((a, b) in unequalPairs) {
            val parsedA = FirstOrderParser.parseTerm(a)
            val parsedB = FirstOrderParser.parseTerm(b)

            assert(!parsedA.synEq(parsedB))
        }
    }
}
