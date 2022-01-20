package kalkulierbar.logic

import kalkulierbar.FormulaConversionException
import kalkulierbar.logic.transform.NaiveCNF
import kalkulierbar.logic.transform.ToBasicOps
import kalkulierbar.logic.transform.TseytinCNF
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
        r2 = Relation(
            "NewRel",
            listOf(
                Constant("c"),
                Function(
                    "f",
                    listOf(
                        Constant("d"),
                        QuantifiedVariable("X")
                    )
                )
            )
        )
        r3 = Relation(
            "Aefjwadg",
            listOf(
                Function(
                    "g",
                    listOf(
                        Function(
                            "f",
                            listOf(Constant("c"), Constant("k"))
                        )
                    )
                )
            )
        )

        u1 = UniversalQuantifier("X", Or(Var("X"), Not(Var("X"))), mutableListOf())
        u2 = UniversalQuantifier(
            "X",
            ExistentialQuantifier(
                "Y",
                UniversalQuantifier(
                    "Z",
                    And(
                        Relation(
                            "R",
                            listOf(
                                QuantifiedVariable("X"),
                                QuantifiedVariable("Y")
                            )
                        ),
                        Relation(
                            "R",
                            listOf(
                                QuantifiedVariable("Y"),
                                QuantifiedVariable("Z")
                            )
                        )
                    ),
                    mutableListOf()
                ),
                mutableListOf()
            ),
            mutableListOf()
        )
        u3 = UniversalQuantifier(
            "Number1",
            ExistentialQuantifier(
                "Number2",
                Relation(
                    "Greater",
                    listOf(
                        QuantifiedVariable("Number1"),
                        QuantifiedVariable("Number2")
                    )
                ),
                mutableListOf()
            ),
            mutableListOf()
        )

        e1 = ExistentialQuantifier("C", Not(Relation("Q", listOf(QuantifiedVariable("C")))), mutableListOf())
        e2 = ExistentialQuantifier(
            "X",
            UniversalQuantifier(
                "Y",
                Relation(
                    "=",
                    listOf(
                        QuantifiedVariable("Y"),
                        Function(
                            "m",
                            listOf(
                                QuantifiedVariable("X"),
                                QuantifiedVariable("Y")
                            )
                        )
                    )
                ),
                mutableListOf()
            ),
            mutableListOf()
        )
        e3 = ExistentialQuantifier(
            "El",
            Impl(
                Relation("P", listOf(QuantifiedVariable("El"))),
                UniversalQuantifier(
                    "Y",
                    Relation("P", listOf(QuantifiedVariable("Y"))),
                    mutableListOf()
                )
            ),
            mutableListOf()
        )
    }

    @Test
    fun testAllBasicOps() {
        assertEquals("(∀X: (X ∨ ¬X))", ToBasicOps.transform(u1).toString())
        assertEquals("(∀X: (∃Y: (∀Z: (R(X, Y) ∧ R(Y, Z)))))", ToBasicOps.transform(u2).toString())
        assertEquals("(∀Number1: (∃Number2: Greater(Number1, Number2)))", ToBasicOps.transform(u3).toString())
    }

    @Test
    fun testAllNaiveCNF() {
        assertFailsWith<FormulaConversionException> {
            NaiveCNF.transform(u1)
        }
    }

    @Test
    fun testAllTseytin() {
        assertFailsWith<FormulaConversionException> {
            TseytinCNF.transform(u1)
        }
    }

    @Test
    fun testExBasicOps() {
        assertEquals("(∃C: ¬Q(C))", ToBasicOps.transform(e1).toString())
        assertEquals("(∃X: (∀Y: =(Y, m(X, Y))))", ToBasicOps.transform(e2).toString())
        assertEquals("(∃El: (¬P(El) ∨ (∀Y: P(Y))))", ToBasicOps.transform(e3).toString())
    }

    @Test
    fun testExNaiveCNF() {
        assertFailsWith<FormulaConversionException> {
            NaiveCNF.transform(e1)
        }
    }

    @Test
    fun testExTseytin() {
        assertFailsWith<FormulaConversionException> {
            TseytinCNF.transform(e1)
        }
    }
}
