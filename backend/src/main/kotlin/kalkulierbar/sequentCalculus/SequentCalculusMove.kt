package kalkulierbar.sequentCalculus

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule

// Context object for move serialization
// Tells kotlinx.serialize about child types of PSCMove
val SequentCalculusMoveModule = SerializersModule {
    polymorphic(SequentCalculusMove::class) {
        Ax::class with Ax.serializer()
        NotRight::class with NotRight.serializer()
        NotLeft::class with NotLeft.serializer()
        OrRight::class with OrRight.serializer()
        OrLeft::class with OrLeft.serializer()
        AndRight::class with AndRight.serializer()
        AndLeft::class with AndLeft.serializer()
        ImpLeft::class with ImpLeft.serializer()
        ImpRight::class with ImpRight.serializer()
        AllRight::class with AllRight.serializer()
        AllLeft::class with AllLeft.serializer()
        ExRight::class with ExRight.serializer()
        ExLeft::class with ExLeft.serializer()
        UndoMove::class with UndoMove.serializer()
        PruneMove::class with PruneMove.serializer()
    }
}

@Serializable
abstract class SequentCalculusMove

@Serializable
@SerialName("Ax")
class Ax(
    val nodeID: Int
) : SequentCalculusMove()

@Serializable
@SerialName("notRight")
class NotRight(
    val nodeID: Int,
    val listIndex: Int
) : SequentCalculusMove()

@Serializable
@SerialName("notLeft")
class NotLeft(
    val nodeID: Int,
    val listIndex: Int
) : SequentCalculusMove()

@Serializable
@SerialName("orRight")
class OrRight(
    val nodeID: Int,
    val listIndex: Int
) : SequentCalculusMove()

@Serializable
@SerialName("andRight")
class AndRight(
    val nodeID: Int,
    val listIndex: Int
) : SequentCalculusMove()

@Serializable
@SerialName("orLeft")
class OrLeft(
    val nodeID: Int,
    val listIndex: Int
) : SequentCalculusMove()

@Serializable
@SerialName("andLeft")
class AndLeft(
    val nodeID: Int,
    val listIndex: Int
) : SequentCalculusMove()

@Serializable
@SerialName("impLeft")
class ImpLeft(
    val nodeID: Int,
    val listIndex: Int
) : SequentCalculusMove()

@Serializable
@SerialName("impRight")
class ImpRight(
    val nodeID: Int,
    val listIndex: Int
) : SequentCalculusMove()

@Serializable
@SerialName("undo")
class UndoMove : SequentCalculusMove()

@Serializable
@SerialName("prune")
class PruneMove(
    val nodeID: Int
) : SequentCalculusMove()

// FOSC MOVES
@Serializable
@SerialName("allLeft")
class AllLeft(
    val nodeID: Int,
    val listIndex: Int,
    val varAssign: Map<String, String>
) : SequentCalculusMove()

@Serializable
@SerialName("allRight")
class AllRight(
    val nodeID: Int,
    val listIndex: Int,
    val varAssign: Map<String, String>
) : SequentCalculusMove()

@Serializable
@SerialName("exLeft")
class ExLeft(
    val nodeID: Int,
    val listIndex: Int,
    val varAssign: Map<String, String>
) : SequentCalculusMove()

@Serializable
@SerialName("exRight")
class ExRight(
    val nodeID: Int,
    val listIndex: Int,
    val varAssign: Map<String, String>
) : SequentCalculusMove()
