package kalkulierbar.tableaux

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.parsers.FirstOrderParser
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.polymorphic
import kotlinx.serialization.modules.subclass

// Context object for move serialization
// Tells kotlinx.serialize about child types of DPLLMove
val tableauxMoveModule =
    SerializersModule {
        polymorphic(TableauxMove::class) {
            subclass(MoveExpand::class)
            subclass(MoveAutoClose::class)
            subclass(MoveLemma::class)
            subclass(MoveUndo::class)
            subclass(MoveCloseAssign::class)
        }
    }

/**
 * Class representing a rule application in a Tableaux
 */
@Serializable
abstract class TableauxMove

@Serializable
@SerialName("tableaux-expand")
data class MoveExpand(
    val id1: Int,
    val id2: Int,
) : TableauxMove()

@Serializable
@SerialName("tableaux-close")
data class MoveAutoClose(
    val id1: Int,
    val id2: Int,
) : TableauxMove()

@Serializable
@SerialName("tableaux-lemma")
data class MoveLemma(
    val id1: Int,
    val id2: Int,
) : TableauxMove()

@Serializable
@SerialName("tableaux-undo")
class MoveUndo : TableauxMove()

// FO-Move
@Serializable
@SerialName("tableaux-close-assign")
data class MoveCloseAssign(
    val id1: Int,
    val id2: Int,
    val varAssign: Map<String, String>,
) : TableauxMove() {
    fun getVarAssignTerms() =
        varAssign.mapValues {
            try {
                FirstOrderParser.parseTerm(it.value)
            } catch (e: InvalidFormulaFormat) {
                throw InvalidFormulaFormat("Could not parse term '${it.value}': ${e.message}")
            }
        }
}
