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

    /**
     * Factorizes this clause
     * - Removes doubled literals
     * - A FO-Clause should be unified before
     */
    fun factorize() {
        // Remove equal literal
        for (i in atoms.indices) {
            for (j in atoms.indices) {
                // Delete if not same position but same literal
                if (i != j && atoms[i] == atoms[j]) {
                    atoms.removeAt(j)
                    continue
                }
            }
        }
    }

    override fun toString(): String {
        return "{${atoms.joinToString(", ")}}"
    }
}
