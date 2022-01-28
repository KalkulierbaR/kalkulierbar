package kalkulierbar.logic

import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.transform.NaiveCNF
import kalkulierbar.logic.transform.ToBasicOps
import kalkulierbar.logic.transform.TseytinCNF
import org.junit.jupiter.api.Test
import kotlin.test.BeforeTest
import kotlin.test.assertEquals

class TestPropositionalLogic {

    private lateinit var v1: Var
    private lateinit var v2: Var
    private lateinit var v3: Var

    private lateinit var n1: Not
    private lateinit var n2: Not
    private lateinit var n3: Not

    private lateinit var a1: And
    private lateinit var a2: And
    private lateinit var a3: And

    private lateinit var o1: Or
    private lateinit var o2: Or
    private lateinit var o3: Or

    @BeforeTest
    fun before() {
        v1 = Var("a")
        v2 = Var("MyTestVar")
        v3 = Var("MyT35tV4r")

        n1 = Not(Var("a"))
        n2 = Not(Equiv(Not(Not(Var("b"))), Var("a")))
        n3 = Not(And(Or(Var("a"), Not(Var("a"))), Not(Var("c"))))

        a1 = And(Not(Var("a")), And(Var("b"), Impl(Var("b"), Var("a"))))
        a2 = And(Var("a"), Not(Var("a")))
        a3 = And(Or(Var("a"), Not(Var("a"))), Var("b"))

        o1 = Or(Var("a"), Var("b"))
        o2 = Or(Or(Var("a"), Not(Var("b"))), Equiv(Var("a"), Var("b")))
        o3 = Or(Not(And(Var("a"), Var("b"))), Not(Impl(Var("b"), Not(Var("b")))))
    }

    @Test
    fun testVarToBasicOps() {
        assertEquals("a", ToBasicOps.transform(v1).toString())
        assertEquals("MyTestVar", ToBasicOps.transform(v2).toString())
        assertEquals("MyT35tV4r", ToBasicOps.transform(v3).toString())
    }

    @Test
    fun testVarNaiveCNF() {
        val expected1 = ClauseSet(mutableListOf(Clause(mutableListOf(Atom("a"))))).toString()
        val expected2 = ClauseSet(mutableListOf(Clause(mutableListOf(Atom("MyTestVar"))))).toString()
        val expected3 = ClauseSet(mutableListOf(Clause(mutableListOf(Atom("MyT35tV4r"))))).toString()

        assertEquals(false, expected1 == expected2)
        assertEquals(expected1, NaiveCNF.transform(v1).toString())
        assertEquals(expected2, NaiveCNF.transform(v2).toString())
        assertEquals(expected3, NaiveCNF.transform(v3).toString())
    }

    @Test
    fun testVarTseytin() {
        assertEquals("{vara}", TseytinCNF.transform(v1).toString())
        assertEquals("{varMyTestVar}", TseytinCNF.transform(v2).toString())
        assertEquals("{varMyT35tV4r}", TseytinCNF.transform(v3).toString())
    }

    @Test
    fun testNotToBasicOps() {
        assertEquals("¬a", ToBasicOps.transform(n1).toString())
        assertEquals("¬((¬¬b ∧ a) ∨ (¬¬¬b ∧ ¬a))", ToBasicOps.transform(n2).toString())
        assertEquals("¬((a ∨ ¬a) ∧ ¬c)", ToBasicOps.transform(n3).toString())
    }

    @Test
    fun testNotNaiveCNF() {
        val expected1 = ClauseSet(mutableListOf(Clause(mutableListOf(Atom("a", true)))))
        assertEquals(expected1.toString(), NaiveCNF.transform(n1).toString())

        val expected2 = "{b, a}, {b, !b}, {!a, a}, {!a, !b}"
        assertEquals(expected2, NaiveCNF.transform(n2).toString())

        val expected3 = ClauseSet(
            mutableListOf(
                Clause(mutableListOf(Atom("a", true), Atom("c"))),
                Clause(mutableListOf(Atom("a"), Atom("c")))
            )
        )
        assertEquals(expected3.toString(), NaiveCNF.transform(n3).toString())
    }

    @Test
    fun testNotTseytin() {
        assertEquals("{not0}, {!vara, !not0}, {vara, not0}", TseytinCNF.transform(n1).toString())
        assertEquals(
            "{not0}, {!varb, !not3}, {varb, not3}, {!not3, !not2}, {not3, not2}, {not2, !vara, !equiv1}, {!not2, vara, !equiv1}, {!not2, !vara, equiv1}, {not2, vara, equiv1}, {!equiv1, !not0}, {equiv1, not0}",
            TseytinCNF.transform(n2).toString()
        )
        assertEquals(
            "{not0}, {!vara, !not4}, {vara, not4}, {!vara, or2}, {!not4, or2}, {vara, not4, !or2}, {!varc, !not6}, {varc, not6}, {or2, !and1}, {not6, !and1}, {!or2, !not6, and1}, {!and1, !not0}, {and1, not0}",
            TseytinCNF.transform(n3).toString()
        )
    }

    @Test
    fun testAndToBasicOps() {
        assertEquals("(¬a ∧ (b ∧ (¬b ∨ a)))", ToBasicOps.transform(a1).toString())
        assertEquals("(a ∧ ¬a)", ToBasicOps.transform(a2).toString())
        assertEquals("((a ∨ ¬a) ∧ b)", ToBasicOps.transform(a3).toString())
    }

    @Test
    fun testAndNaiveCNF() {
        assertEquals("{!a}, {b}, {!b, a}", NaiveCNF.transform(a1).toString())
        assertEquals("{a}, {!a}", NaiveCNF.transform(a2).toString())
        assertEquals("{a, !a}, {b}", NaiveCNF.transform(a3).toString())
    }

    @Test
    fun testAndTseytin() {
        assertEquals(
            "{and0}, {!vara, !not1}, {vara, not1}, {varb, impl5}, {!vara, impl5}, {!varb, vara, !impl5}, {varb, !and3}, {impl5, !and3}, {!varb, !impl5, and3}, {not1, !and0}, {and3, !and0}, {!not1, !and3, and0}",
            TseytinCNF.transform(a1).toString()
        )
        assertEquals(
            "{and0}, {!vara, !not2}, {vara, not2}, {vara, !and0}, {not2, !and0}, {!vara, !not2, and0}",
            TseytinCNF.transform(a2).toString()
        )
        assertEquals(
            "{and0}, {!vara, !not3}, {vara, not3}, {!vara, or1}, {!not3, or1}, {vara, not3, !or1}, {or1, !and0}, {varb, !and0}, {!or1, !varb, and0}",
            TseytinCNF.transform(a3).toString()
        )
    }

    @Test
    fun testOrToBasicOps() {
        assertEquals("(a ∨ b)", ToBasicOps.transform(o1).toString())
        assertEquals("((a ∨ ¬b) ∨ ((a ∧ b) ∨ (¬a ∧ ¬b)))", ToBasicOps.transform(o2).toString())
        assertEquals("(¬(a ∧ b) ∨ ¬(¬b ∨ ¬b))", ToBasicOps.transform(o3).toString())
    }

    @Test
    fun testOrNaiveCNF() {
        assertEquals("{a, b}", NaiveCNF.transform(o1).toString())
        assertEquals("{a, !b, a, !a}, {a, !b, a, !b}, {a, !b, b, !a}, {a, !b, b, !b}", NaiveCNF.transform(o2).toString())
        assertEquals("{!a, !b, b}, {!a, !b, b}", NaiveCNF.transform(o3).toString())
    }

    @Test
    fun testOrTseytin() {
        assertEquals(
            "{or0}, {!vara, or0}, {!varb, or0}, {vara, varb, !or0}",
            TseytinCNF.transform(o1).toString()
        )
        assertEquals(
            "{or0}, {!varb, !not3}, {varb, not3}, {!vara, or1}, {!not3, or1}, {vara, not3, !or1}, {vara, !varb, !equiv5}, {!vara, varb, !equiv5}, {!vara, !varb, equiv5}, {vara, varb, equiv5}, {!or1, or0}, {!equiv5, or0}, {or1, equiv5, !or0}",
            TseytinCNF.transform(o2).toString()
        )
        assertEquals(
            "{or0}, {vara, !and2}, {varb, !and2}, {!vara, !varb, and2}, {!and2, !not1}, {and2, not1}, {!varb, !not8}, {varb, not8}, {varb, impl6}, {!not8, impl6}, {!varb, not8, !impl6}, {!impl6, !not5}, {impl6, not5}, {!not1, or0}, {!not5, or0}, {not1, not5, !or0}",
            TseytinCNF.transform(o3).toString()
        )
    }
}
