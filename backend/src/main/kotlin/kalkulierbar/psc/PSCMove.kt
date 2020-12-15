package kalkulierbar.psc

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.parsers.FirstOrderParser
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule

// Context object for move serialization
// Tells kotlinx.serialize about child types of PSCMove
val PSCMoveModule = SerializersModule {
    polymorphic(PSCMove::class) {
        NotRight::class with NotRight.serializer()
        UndoMove::class with UndoMove.serializer()
    }
}

@Serializable
abstract class PSCMove


@Serializable
@SerialName("notRight")
class NotRight(
    val nodeID: Int,
    val listIndex: Int
) : PSCMove() {
}

@Serializable
@SerialName("notLeft")
class NotLeft(
    val nodeID: Int,
    val listIndex: Int
) : PSCMove() {
}

@Serializable
@SerialName("undo")
class UndoMove : PSCMove() {
    override fun toString() = "(undo)"
}
