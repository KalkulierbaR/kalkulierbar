package main.kotlin.kalkulierbar.clause

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonConfiguration
import main.kotlin.kalkulierbar.JSONSerializable

val json = Json(JsonConfiguration.Stable)

@Serializable
class ClauseSet(private var clauses: MutableSet<Clause> = HashSet()) : JSONSerializable {
    fun add(c: Clause) {
        clauses.add(c)
    }

    fun addAll(c: Collection<Clause>) {
        c.forEach { add(it) }
    }

    override fun toJSON() = json.stringify(ClauseSet.serializer(), this)

    override fun toString(): String {
        return clauses.joinToString(", ")
    }
}