package kalkulierbar.tests.logic

import kalkulierbar.FormulaConversionException
import kalkulierbar.logic.And
import kalkulierbar.logic.Constant
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.Function
import kalkulierbar.logic.Impl
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier
import kalkulierbar.logic.Var
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestFOLogic {
    private lateinit var r1: Relation
    private lateinit var r2: Relation
    private lateinit var r3: Relation

    private lateinit var u1: UniversalQuantifier
    private lateinit var u2: UniversalQuantifier
    private lateinit var u3: UniversalQuantifier

    private lateinit var e1: ExistentialQuantifier
    private lateinit var e2: ExistentialQuantifier
    private lateinit var e3: ExistentialQuantifier

    @BeforeTest
    fun before() {
        r1 = Relation("R1", listOf(QuantifiedVariable("Abc")))
        r2 = Relation("NewRel",
                listOf(
                        Constant("c"),
                        Function("f",
                                listOf(Constant("d"),
                                        QuantifiedVariable("X")))))
        r3 = Relation("Aefjwadg",
                listOf(
                        Function("g",
                                listOf(
                                        Function("f",
                                                listOf(Constant("c"), Constant("k")))))))

        u1 = UniversalQuantifier("X", Or(Var("X"), Not(Var("X"))), listOf())
        u2 = UniversalQuantifier("X",
                ExistentialQuantifier("Y",
                        UniversalQuantifier("Z",
                                And(
                                        Relation("R",
                                                listOf(QuantifiedVariable("X"),
                                                        QuantifiedVariable("Y"))),
                                        Relation("R",
                                                listOf(QuantifiedVariable("Y"),
                                                        QuantifiedVariable("Z")))),
                                listOf()),
                        listOf()),
                listOf())
        u3 = UniversalQuantifier("Number1",
                ExistentialQuantifier("Number2",
                        Relation("Greater",
                                listOf(QuantifiedVariable("Number1"),
                                        QuantifiedVariable("Number2"))),
                        listOf()),
                listOf())

        e1 = ExistentialQuantifier("C", Not(Relation("Q", listOf(QuantifiedVariable("C")))), listOf())
        e2 = ExistentialQuantifier("X",
                UniversalQuantifier("Y",
                        Relation("=",
                                listOf(
                                        QuantifiedVariable("Y"),
                                        Function("m",
                                                listOf(QuantifiedVariable("X"),
                                                        QuantifiedVariable("Y"))))),
                        listOf()),
                listOf())
        e3 = ExistentialQuantifier("El",
                Impl(
                        Relation("P", listOf(QuantifiedVariable("El"))),
                        UniversalQuantifier("Y",
                                Relation("P", listOf(QuantifiedVariable("Y"))),
                                listOf())
                ),
                listOf())
    }

    @Test
    fun testRelBasicOps() {
        assertEquals("R1(Abc)", r1.toBasicOps().toString())
        assertEquals("NewRel(c, f(d, X))", r2.toBasicOps().toString())
        assertEquals("Aefjwadg(g(f(c, k)))", r3.toBasicOps().toString())
    }

    @Test
    fun testRelNaiveCNF() {
        assertEquals("{R1(Abc)}", r1.naiveCNF().toString())
        assertEquals("{NewRel(c, f(d, X))}", r2.naiveCNF().toString())
        assertEquals("{Aefjwadg(g(f(c, k)))}", r3.naiveCNF().toString())
    }

    @Test
    fun testRelTseytin() {
        assertEquals("{relR1(Abc)}", r1.tseytinCNF().toString())
        assertEquals("{relNewRel(c, f(d, X))}", r2.tseytinCNF().toString())
        assertEquals("{relAefjwadg(g(f(c, k)))}", r3.tseytinCNF().toString())
    }

    @Test
    fun testAllBasicOps() {
        assertEquals("(∀X: (X ∨ !X))", u1.toBasicOps().toString())
        assertEquals("(∀X: (∃Y: (∀Z: (R(X, Y) ∧ R(Y, Z)))))", u2.toBasicOps().toString())
        assertEquals("(∀Number1: (∃Number2: Greater(Number1, Number2)))", u3.toBasicOps().toString())
    }

    @Test
    fun testAllNaiveCNF() {
        assertFailsWith<FormulaConversionException> {
            u1.naiveCNF()
        }
    }

    @Test
    fun testAllTseytin() {
        assertFailsWith<FormulaConversionException> {
            u1.tseytinCNF()
        }
    }

    @Test
    fun testExBasicOps() {
        assertEquals("(∃C: !Q(C))", e1.toBasicOps().toString())
        assertEquals("(∃X: (∀Y: =(Y, m(X, Y))))", e2.toBasicOps().toString())
        assertEquals("(∃El: (!P(El) ∨ (∀Y: P(Y))))", e3.toBasicOps().toString())
    }

    @Test
    fun testExNaiveCNF() {
        assertFailsWith<FormulaConversionException> {
            e1.naiveCNF()
        }
    }

    @Test
    fun testExTseytin() {
        assertFailsWith<FormulaConversionException> {
            e1.tseytinCNF()
        }
    }
}
