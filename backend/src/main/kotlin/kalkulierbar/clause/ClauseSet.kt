package kalkulierbar.clause

import kotlinx.serialization.Serializable

@Serializable
class ClauseSet(var clauses: MutableList<Clause> = mutableListOf()) {
    fun add(c: Clause) {
        clauses.add(c)
    }

    fun addAll(c: Collection<Clause>) {
        c.forEach {
            if (!clauses.contains(it))
                add(it)
        }
    }

    fun unite(cs: ClauseSet) = addAll(cs.clauses)

    override fun toString(): String {
        return clauses.joinToString(", ")
    }
}
