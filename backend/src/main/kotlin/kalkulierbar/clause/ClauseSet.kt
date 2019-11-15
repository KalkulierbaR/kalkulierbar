package kalkulierbar.clause

import kotlinx.serialization.Serializable

@Serializable
class ClauseSet(private var clauses: MutableSet<Clause> = HashSet()) {
    fun add(c: Clause) {
        clauses.add(c)
    }

    fun addAll(c: Collection<Clause>) {
        c.forEach { add(it) }
    }

    override fun toString(): String {
        return clauses.joinToString(", ")
    }
}
