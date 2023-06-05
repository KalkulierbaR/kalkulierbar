package kalkulierbar.logic.transform

import kalkulierbar.parsers.FirstOrderParser
import main.kotlin.kalkulierbar.logic.transform.CompoundSignature
import main.kotlin.kalkulierbar.logic.transform.Signature
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFails

class TestSignature {
    private val validFormulas = mapOf(
        "P(f(a, b))" to "Σ(constants={a, b}, functions={f(2)}, relations={P(1)}, bound={})",
        "P(a, g(f(f(f(a))), b, f(c))) & Q(a, b, c)" to "Σ(constants={a, b, c}, functions={f(1), g(3)}, relations={P(2), Q(3)}, bound={})",
        "/all X: /all Y: /all Z: (P(X, Y) & P(Y, Z) -> P(X, Z)) & P(a, f(a, a)) & P(f(a, a), g(a, a, a, a))" to "Σ(constants={a}, functions={f(2), g(4)}, relations={P(2)}, bound={X, Y, Z})"
    )

    private val mixedArity = listOf(
        "P(a) & P(a, b)",
        "P(f(a, b), f(c), f(a, b, c))",
        "P(a, a(b))",
        "P(a(a))"
    )

    private val sig1 = signature("Σ(constants={a, b, c}, functions={f(1), g(3)}, relations={P(2), Q(3)}, bound={})")
    private val validTerms = listOf(
        "a", "b", "c", "f(a)", "f(f(b))", "g(f(a), b, g(c, b, f(a)))", "d"
    )
    private val invalidTerms = listOf(
        "a(b)", "f", "f(a, a)", "g(a)", "g(a, b)", "f(g(a, a, b, c))"
    )

    private fun compound(s: String): CompoundSignature {
        val regex = Regex("^(\\w+)\\((\\d+)\\)$")
        val m = regex.find(s)!!
        return CompoundSignature(m.groupValues[1], m.groupValues[2].toInt())
    }

    private fun list(s: String): List<String> {
        if (s == "") return listOf()
        return s.split(", ")
    }

    private fun signature(s: String): Signature {
        val regex = Regex("^Σ\\(constants=\\{(.*)}, functions=\\{(.*)}, relations=\\{(.*)}, bound=\\{(.*)}\\)$")
        val m = regex.find(s)!!
        val c = list(m.groupValues[1]).toSet()
        val f = list(m.groupValues[2]).map { compound(it) }.toSet()
        val r = list(m.groupValues[3]).map { compound(it) }.toSet()
        val b = list(m.groupValues[4]).toSet()
        return Signature(c, f, r, b)
    }

    @Test
    fun testValid() {
        validFormulas.forEach { (f, expected) ->
            val formula = FirstOrderParser.parse(f)
            val sig = Signature.of(formula)

            assertEquals(signature(expected), sig)

            val cs = FirstOrderCNF.transform(formula)
            val csSig = Signature.of(cs)

            if (csSig.boundVariables.isEmpty())
                assertEquals(signature(expected), csSig)
            else assertEquals(
                signature(expected), csSig
            )
        }
    }

    @Test
    fun testMixedArity() {
        mixedArity.forEach {
            assertFails(it) {
                FirstOrderParser.parse(it)
            }
        }
    }

    @Test
    fun testValidTerms() {
        validTerms.forEach {
            val term = FirstOrderParser.parseTerm(it)
            sig1.check(term)
        }
    }

    @Test
    fun testInvalidTerm() {
        invalidTerms.forEach {
            val term = FirstOrderParser.parseTerm(it)
            assertFails(it) { sig1.check(term) }
        }
    }
}
