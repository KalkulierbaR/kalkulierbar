package kalkulierbar.fosc

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.parsers.FirstOrderParser
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule

// Context object for move serialization
// Tells kotlinx.serialize about child types of FOSCMove
val FOSCMoveModule = SerializersModule {
    polymorphic(FOSCMove::class) {
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
abstract class FOSCMove

@Serializable
@SerialName("Ax")
class Ax(
    val nodeID: Int
) : FOSCMove() {
}

@Serializable
@SerialName("notRight")
class NotRight(
    val nodeID: Int,
    val listIndex: Int
) : FOSCMove() {
}

@Serializable
@SerialName("notLeft")
class NotLeft(
    val nodeID: Int,
    val listIndex: Int
) : FOSCMove() {
}

@Serializable
@SerialName("orRight")
class OrRight(
        val nodeID: Int,
        val listIndex: Int
) : FOSCMove() {
}

@Serializable
@SerialName("andRight")
class AndRight(
    val nodeID: Int,
    val listIndex: Int
) : FOSCMove() {
}

@Serializable
@SerialName("orLeft")
class OrLeft(
        val nodeID: Int,
        val listIndex: Int
) : FOSCMove() {
}

@Serializable
@SerialName("andLeft")
class AndLeft(
    val nodeID: Int,
    val listIndex: Int
) : FOSCMove() {
}

@Serializable
@SerialName("undo")
class UndoMove : FOSCMove() {
    override fun toString() = "(undo)"
}
