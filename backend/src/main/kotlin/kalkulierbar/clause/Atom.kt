package kalkulierbar.clause

import kalkulierbar.logic.SyntacticEquality
import kotlinx.serialization.Serializable

@Serializable
data class Atom<AtomType>(val lit: AtomType, val negated: Boolean = false) : SyntacticEquality {
    operator fun not() = Atom(lit, !negated)

    override fun toString(): String {
        return if (negated) "!$lit" else lit.toString()
    }

    override fun synEq(other: Any?): Boolean {
        var eq = false

        if (other is Atom<*> && other.negated == negated) {
            // Use syntactic equality for literal comparison if defined
            eq = if (lit is SyntacticEquality) {
                lit.synEq(other.lit)
            } else {
                lit == other.lit
            }
        }

        return eq
    }

    override fun clone(): Atom<AtomType> {
        return if (lit is SyntacticEquality) {
            @Suppress("UNCHECKED_CAST")
            Atom(lit.clone() as AtomType, negated)
        } else {
            Atom(lit, negated)
        }
    }

    /**
     * Override equality to match syntactic equality intuition
     * @param other Atom to compare against
     * @return true iff the two atoms are syntactically equal
     */
    override fun equals(other: Any?) = synEq(other)

    override fun hashCode() = lit.toString().hashCode() + negated.toString().hashCode()
}
