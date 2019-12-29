package kalkulierbar

import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.And
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Var
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class TestPropNot {

    val n1 = Not(Var("a"))
    val n2 = Not(Not(Var("b")))
    val n3 = Not(And(Or(Var("a"), Not(Var("a"))), Not(Var("c"))))

    @Test
    fun testToBasicOps() {
        assertEquals(n1, n1.toBasicOps())
        assertEquals(n2, n2.toBasicOps())
        assertEquals(n3, n3.toBasicOps())
    }

    @Test
    fun testGetTseytinName() {
        assertEquals("not1", n1.getTseytinName(1))
        assertEquals("not345", n2.getTseytinName(345))
    }

    @Test
    fun testNaiveCNF() {
        val expected1 = ClauseSet(mutableListOf(Clause(mutableListOf(Atom("a", true)))))
        assertEquals(expected1, n1.naiveCNF())

        val expected2 = ClauseSet(mutableListOf(Clause(mutableListOf(Atom("b")))))
        assertEquals(expected2, n2.naiveCNF())

        val expected3 = ClauseSet(mutableListOf(Clause(mutableListOf(Atom("a", true), Atom("c"))),
                Clause(mutableListOf(Atom("a"), Atom("c")))))
        assertEquals(expected3, n3.naiveCNF())
    }
}