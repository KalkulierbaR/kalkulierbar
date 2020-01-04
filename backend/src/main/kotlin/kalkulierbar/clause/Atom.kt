package kalkulierbar.clause

import kotlinx.serialization.Serializable

@Serializable
data class Atom(val lit: String, val negated: Boolean = false) {
    operator fun not() = Atom(lit, !negated)

    override fun toString(): String {
        return if (negated) "!$lit" else lit
    }
}
