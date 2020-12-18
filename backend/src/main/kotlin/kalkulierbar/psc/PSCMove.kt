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
        Ax::class with Ax.serializer()
        NotRight::class with NotRight.serializer()
        NotLeft::class with NotLeft.serializer()
        OrRight::class with OrRight.serializer()
        OrLeft::class with OrLeft.serializer()
        AndRight::class with AndRight.serializer()
        AndLeft::class with AndLeft.serializer()
        UndoMove::class with UndoMove.serializer()
    }
}

@Serializable
abstract class PSCMove

@Serializable
@SerialName("Ax")
class Ax(
    val nodeID: Int
) : PSCMove() {
}

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
@SerialName("orRight")
class OrRight(
        val nodeID: Int,
        val listIndex: Int
) : PSCMove() {
}

@Serializable
@SerialName("andRight")
class AndRight(
    val nodeID: Int,
    val listIndex: Int
) : PSCMove() {
}

@Serializable
@SerialName("orLeft")
class OrLeft(
        val nodeID: Int,
        val listIndex: Int
) : PSCMove() {
}

@Serializable
@SerialName("andLeft")
class AndLeft(
    val nodeID: Int,
    val listIndex: Int
) : PSCMove() {
}

@Serializable
@SerialName("undo")
class UndoMove : PSCMove() {
    override fun toString() = "(undo)"
}
