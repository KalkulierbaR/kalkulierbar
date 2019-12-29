package kalkulierbar.clause

import kotlinx.serialization.Serializable

@Serializable
class Clause(var atoms: MutableList<Atom> = mutableListOf()) {
    fun add(a: Atom) {
        atoms.add(a)
    }

    fun addAll(c: Collection<Atom>) {
        c.forEach { add(it) }
    }

    override fun toString(): String {
        return "{${atoms.joinToString(", ")}}"
    }
}
