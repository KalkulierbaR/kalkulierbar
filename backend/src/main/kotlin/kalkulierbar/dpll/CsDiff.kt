package kalkulierbar.dpll

import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.plus

// Context object for clause set diff serialization
// Tells kotlinx.serialize about child types of CsDiff
val clausesetDiffModule = SerializersModule {
    polymorphic(CsDiff::class) {
        Identity::class with Identity.serializer()
        RemoveClause::class with RemoveClause.serializer()
        AddClause::class with AddClause.serializer()
        RemoveAtom::class with RemoveAtom.serializer()
    }
}

@Serializable
abstract class CsDiff {
    abstract fun apply(cs: ClauseSet<String>): ClauseSet<String>
}

/**
 * Clause set diff operation representing no change
 */
@Serializable
@SerialName("cd-identity")
class Identity : CsDiff() {
    override fun apply(cs: ClauseSet<String>) = cs

    override fun toString() = "identity"
}

/**
 * Clause set diff operation representing removal of a clause
 */
@Serializable
@SerialName("cd-delclause")
class RemoveClause(val id: Int) : CsDiff() {
    override fun apply(cs: ClauseSet<String>): ClauseSet<String> {
        val new = cs.clone()
        new.clauses.removeAt(id)
        return new
    }

    override fun toString() = "remove-$id"
}

/**
 * Clause set diff operation representing addition of a clause
 */
@Serializable
@SerialName("cd-addclause")
class AddClause(val clause: Clause<String>) : CsDiff() {
    override fun apply(cs: ClauseSet<String>): ClauseSet<String> {
        val new = cs.clone()
        new.add(clause)
        return new
    }

    override fun toString() = "add-$clause"
}

/**
 * Clause set diff operation representing removal of an atom from a clause
 */
@Serializable
@SerialName("cd-delatom")
class RemoveAtom(val cid: Int, val aid: Int) : CsDiff() {
    override fun apply(cs: ClauseSet<String>): ClauseSet<String> {
        val new = cs.clone()
        new.clauses[cid].atoms.removeAt(aid)
        return new
    }

    override fun toString() = "remove-$cid-$aid"
}
