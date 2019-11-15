package main.kotlin.kalkulierbar.clause

import kotlinx.serialization.Serializable

@Serializable
class Clause(private var atoms: MutableSet<Atom> = HashSet()) {
    fun add(a: Atom) {
        atoms.add(a)
    }

    fun addAll(c: Collection<Atom>) {
        c.forEach { add(it) }
    }

    override fun toString(): String {
        return "{${atoms.joinToString(", ")}}"
    }
}