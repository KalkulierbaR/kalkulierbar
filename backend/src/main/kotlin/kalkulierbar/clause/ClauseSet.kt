package kalkulierbar.clause

import kotlinx.serialization.Serializable

@Serializable
class ClauseSet<AtomType>(var clauses: MutableList<Clause<AtomType>> = mutableListOf()) {
    fun add(c: Clause<AtomType>) {
        clauses.add(c)
    }

    fun addAll(c: Collection<Clause<AtomType>>) {
        c.forEach {
            if (!clauses.contains(it))
                add(it)
        }
    }

    fun unite(cs: ClauseSet<AtomType>) = addAll(cs.clauses)

    override fun toString(): String {
        return clauses.joinToString(", ")
    }
}
