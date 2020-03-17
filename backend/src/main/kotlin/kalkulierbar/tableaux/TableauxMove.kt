package kalkulierbar.tableaux

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.parsers.FirstOrderParser
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule

// Context object for move serialization
// Tells kotlinx.serialize about child types of DPLLMove
val dpllMoveModule = SerializersModule {
    polymorphic(TableauxMove::class) {
        MoveExpand::class with MoveExpand.serializer()
        MoveClose::class with MoveClose.serializer()
        MoveLemma::class with MoveLemma.serializer()
        MoveUndo::class with MoveUndo.serializer()
        MoveCloseAssign::class with MoveCloseAssign.serializer()
    }
}

/**
 * Class representing a rule application in a Tableaux
 */
@Serializable
abstract class TableauxMove// (val type: MoveType, val id1: Int, val id2: Int)

@Serializable
@SerialName("tableaux-expand")
data class MoveExpand(val id1: Int, val id2: Int) : TableauxMove()

@Serializable
@SerialName("tableaux-close")
data class MoveClose(val id1: Int, val id2: Int) : TableauxMove()

@Serializable
@SerialName("tableaux-lemma")
data class MoveLemma(val id1: Int, val id2: Int) : TableauxMove()

@Serializable
@SerialName("tableaux-undo")
data class MoveUndo(val id1: Int, val id2: Int) : TableauxMove()

// FO-Move
@Serializable
@SerialName("tableaux-close-assign")
data class MoveCloseAssign(val id1: Int, val id2: Int, val varAssign: Map<String, String>) : TableauxMove() {
    fun getVarAssignTerms() = varAssign.mapValues {
        try {
            FirstOrderParser.parseTerm(it.value)
        } catch (e: InvalidFormulaFormat) {
            throw InvalidFormulaFormat("Could not parse term '${it.value}': ${e.message}")
        }
    }
}
