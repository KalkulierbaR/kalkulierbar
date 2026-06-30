package kalkulierbar.clause

import kotlinx.serialization.Serializable

@Serializable
class ClauseSet<AtomType>(
    var clauses: MutableList<Clause<AtomType>> = mutableListOf(),
) {
    fun add(c: Clause<AtomType>) {
        clauses.add(c)
    }

    fun addAll(c: Collection<Clause<AtomType>>) {
        c.forEach {
            if (!clauses.contains(it)) {
                add(it)
            }
        }
    }

    fun unite(cs: ClauseSet<AtomType>) = addAll(cs.clauses)

    fun clone(): ClauseSet<AtomType> {
        val newCS = ClauseSet<AtomType>()
        for (c in clauses) {
            newCS.add(c.clone())
        }
        return newCS
    }

    override fun toString(): String = clauses.joinToString(", ")
}
