package kalkulierbar

import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.Var
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class TestPropVar {

    val v1 = Var("a")
    val v2 = Var("MyTestVar")
    val v3 = Var("MyT35tV4r")

    @Test
    fun testToBasicOps() {
        assertEquals(v1, v1.toBasicOps())
        assertEquals(v2, v2.toBasicOps())
        assertEquals(v3, v3.toBasicOps())
    }

    @Test
    fun testGetTseytinName() {
        assertEquals("vara", v1.getTseytinName(0))
        assertEquals("varMyTestVar", v2.getTseytinName(69))
        assertEquals("varMyT35tV4r", v3.getTseytinName(1337))
    }

    @Test
    fun testNaiveCNF() {
        val expected1 = ClauseSet(mutableListOf(Clause(mutableListOf(Atom("a")))))
        val expected2 =  ClauseSet(mutableListOf(Clause(mutableListOf(Atom("MyTestVar")))))
        val expected3 =  ClauseSet(mutableListOf(Clause(mutableListOf(Atom("MyT35tV4r")))))

        assertEquals(false, expected1 == expected2)
        assertEquals(expected1, v1.naiveCNF())
        assertEquals(expected2, v2.naiveCNF())
        assertEquals(expected3, v3.naiveCNF())

    }
}