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

class TestPropositionalLogic {

    val v1 = Var("a")
    val v2 = Var("MyTestVar")
    val v3 = Var("MyT35tV4r")

    val n1 = Not(Var("a"))
    val n2 = Not(Not(Var("b")))
    val n3 = Not(And(Or(Var("a"), Not(Var("a"))), Not(Var("c"))))

    @Test
    fun testVarToBasicOps() {
        assertEquals(v1, v1.toBasicOps())
        assertEquals(v2, v2.toBasicOps())
        assertEquals(v3, v3.toBasicOps())
    }

    @Test
    fun testVarGetTseytinName() {
        assertEquals("vara", v1.getTseytinName(0))
        assertEquals("varMyTestVar", v2.getTseytinName(69))
        assertEquals("varMyT35tV4r", v3.getTseytinName(1337))
    }

    @Test
    fun testVarNaiveCNF() {
        val expected1 = ClauseSet(mutableListOf(Clause(mutableListOf(Atom("a")))))
        val expected2 =  ClauseSet(mutableListOf(Clause(mutableListOf(Atom("MyTestVar")))))
        val expected3 =  ClauseSet(mutableListOf(Clause(mutableListOf(Atom("MyT35tV4r")))))

        assertEquals(false, expected1 == expected2)
        assertEquals(expected1, v1.naiveCNF())
        assertEquals(expected2, v2.naiveCNF())
        assertEquals(expected3, v3.naiveCNF())

    }

    @Test
    fun testNotToBasicOps() {
        assertEquals(n1, n1.toBasicOps())
        assertEquals(n2, n2.toBasicOps())
        assertEquals(n3, n3.toBasicOps())
    }

    @Test
    fun testNotGetTseytinName() {
        assertEquals("not1", n1.getTseytinName(1))
        assertEquals("not345", n2.getTseytinName(345))
    }

    @Test
    fun testNotNaiveCNF() {
        val expected1 = ClauseSet(mutableListOf(Clause(mutableListOf(Atom("a", true)))))
        assertEquals(expected1, n1.naiveCNF())

        val expected2 = ClauseSet(mutableListOf(Clause(mutableListOf(Atom("b")))))
        assertEquals(expected2, n2.naiveCNF())

        val expected3 = ClauseSet(mutableListOf(Clause(mutableListOf(Atom("a", true), Atom("c"))),
                Clause(mutableListOf(Atom("a"), Atom("c")))))
        assertEquals(expected3, n3.naiveCNF())
    }
}