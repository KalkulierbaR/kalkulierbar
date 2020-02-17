package kalkulierbar.clause

import kotlinx.serialization.Serializable

@Serializable
class Clause<AtomType>(var atoms: MutableList<Atom<AtomType>> = mutableListOf()) {
    fun add(a: Atom<AtomType>) {
        atoms.add(a)
    }

    fun addAll(c: Collection<Atom<AtomType>>) {
        c.forEach { add(it) }
    }

    fun clone(): Clause<AtomType> {
        val newClause = Clause<AtomType>()
        for (c in atoms) {
            newClause.add(c.copy())
        }
        return newClause
    }

    override fun toString(): String {
        return "{${atoms.joinToString(", ")}}"
    }
}
