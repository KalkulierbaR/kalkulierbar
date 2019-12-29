package kalkulierbar.clause

import kotlinx.serialization.Serializable

@Serializable
class ClauseSet(var clauses: MutableList<Clause> = mutableListOf()) {
    fun add(c: Clause) {
        clauses.add(c)
    }

    fun addAll(c: Collection<Clause>) {
        c.forEach { add(it) }
    }

    fun unite(cs: ClauseSet) = addAll(cs.clauses)

    override fun toString(): String {
        return clauses.joinToString(", ")
    }

    override fun equals(other: Any?): Boolean {
        if (other !is ClauseSet || other.clauses.size != clauses.size)
            return false
        for ((c1, c2) in clauses.zip(other.clauses)) {
            if (c1 != c2)
                return false
        }
        return true
    }
}
