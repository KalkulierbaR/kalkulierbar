package kalkulierbar.clause

import kalkulierbar.logic.SyntacticEquality
import kotlinx.serialization.Serializable

@Serializable
data class Atom<AtomType>(val lit: AtomType, val negated: Boolean = false) {
    operator fun not() = Atom(lit, !negated)

    override fun toString(): String {
        return if (negated) "!$lit" else lit.toString()
    }

    /**
     * Override equality to match syntactic equality intuition
     * @param other Atom to compare against
     * @return true iff the two atoms are syntactically equal
     */
    override fun equals(other: Any?): Boolean {
        var eq = false

        if (other is Atom<*> && other.negated == negated) {
            // Use syntactic equality for literal comparison if defined
            if (lit is SyntacticEquality)
                eq = lit.synEq(other.lit)
            else
                eq = (lit == other.lit)
        }

        return eq
    }
}
