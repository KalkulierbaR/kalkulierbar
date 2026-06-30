package kalkulierbar.clause

import kotlinx.serialization.Serializable

@Serializable
class Clause<AtomType>(
    var atoms: MutableList<Atom<AtomType>> = mutableListOf(),
) {
    fun add(a: Atom<AtomType>) {
        atoms.add(a)
    }

    fun addAll(c: Collection<Atom<AtomType>>) {
        c.forEach { add(it) }
    }

    fun clone(): Clause<AtomType> {
        val newClause = Clause<AtomType>()
        for (c in atoms) {
            newClause.add(c.clone())
        }
        return newClause
    }

    fun isPositive() = atoms.all { !it.negated }

    fun isEmpty() = atoms.isEmpty()

    val size: Int
        get() = atoms.size

    override fun toString(): String = "{${atoms.joinToString(", ")}}"
}
