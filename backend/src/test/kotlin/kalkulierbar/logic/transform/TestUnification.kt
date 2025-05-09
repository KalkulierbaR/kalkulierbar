package kalkulierbar.logic.transform

import kalkulierbar.UnificationImpossible
import kalkulierbar.logic.util.Unification
import kalkulierbar.parsers.FirstOrderParser
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

// Examples from: https://en.wikipedia.org/wiki/Unification_(computer_science)

class TestUnification {
    private val parser = FirstOrderParser()

    private val valid =
        mapOf(
            "R(a) & R(a)" to "{}",
            "\\all X: (R(X) & R(X))" to "{}",
            "R(a) & \\all X: R(X)" to "{X=a}",
            "\\all X: R(X) & \\all Y: R(Y)" to "{X=Y}",
            "\\all X: R(f(a,X)) & R(f(a,b))" to "{X=b}",
            "\\all X: R(f(X)) & \\all Y: R(f(Y))" to "{X=Y}",
            "\\all X: R(X) & \\all Y: R(Y)" to "{X=Y}",
            "\\all X: R(f(g(X))) & \\all Y: R(f(Y))" to "{Y=g(X)}",
            "\\all X: R(f(g(X),X)) & \\all Y: R(f(Y,a))" to "{X=a, Y=g(a)}",
            "\\all X: R(X) & \\all Y: R(Y)" to "{X=Y}",
        )

    private val invalid =
        listOf(
            "R(a) & R(b)",
            "R(f(a)) & R(g(a))",
            "R(a) & Q(a)",
            "R(a, c) & R(a,b)",
            "\\all X: \\all Y: (R(f(X)) & R(g(Y)))",
            "\\all X: (R(f(X)) & R(X))",
        )

    @Test
    fun testValid() {
        for ((f, e) in valid) {
            val parsed = parser.parse(f)
            val cs = FirstOrderCNF.transform(parsed)
            val r1 = cs.clauses[0].atoms[0].lit
            val r2 = cs.clauses[1].atoms[0].lit
            val map = Unification.unify(r1, r2)
            assertEquals(e, map.toString())
        }
    }

    @Test
    fun testInvalid() {
        for (f in invalid) {
            val parsed = parser.parse(f)
            val cs = FirstOrderCNF.transform(parsed)
            val r1 = cs.clauses[0].atoms[0].lit
            val r2 = cs.clauses[1].atoms[0].lit

            assertFailsWith<UnificationImpossible> {
                Unification.unify(r1, r2)
            }
        }
    }
}
