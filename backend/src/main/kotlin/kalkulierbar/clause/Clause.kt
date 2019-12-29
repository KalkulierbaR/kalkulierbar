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

    override fun equals(other: Any?): Boolean {
        if (other !is Clause || other.atoms.size != atoms.size)
            return false
        for ((a1, a2) in atoms.zip(other.atoms)) {
            if (a1 != a2)
                return false
        }
        return true
    }
}
