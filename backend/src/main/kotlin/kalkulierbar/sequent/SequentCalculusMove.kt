package kalkulierbar.sequent

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.polymorphic
import kotlinx.serialization.modules.subclass

// Context object for move serialization
// Tells kotlinx.serialize about child types of PSCMove
val SequentCalculusMoveModule = SerializersModule {
    polymorphic(SequentCalculusMove::class) {
        subclass(Ax::class)
        subclass(NotRight::class)
        subclass(NotLeft::class)
        subclass(OrRight::class)
        subclass(OrLeft::class)
        subclass(AndRight::class)
        subclass(AndLeft::class)
        subclass(ImpLeft::class)
        subclass(ImpRight::class)
        subclass(AllRight::class)
        subclass(AllLeft::class)
        subclass(ExRight::class)
        subclass(ExLeft::class)
        subclass(UndoMove::class)
        subclass(PruneMove::class)
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
    val instTerm: String
) : SequentCalculusMove()

@Serializable
@SerialName("allRight")
class AllRight(
    val nodeID: Int,
    val listIndex: Int,
    val instTerm: String?
) : SequentCalculusMove()

@Serializable
@SerialName("exLeft")
class ExLeft(
    val nodeID: Int,
    val listIndex: Int,
    val instTerm: String?
) : SequentCalculusMove()

@Serializable
@SerialName("exRight")
class ExRight(
    val nodeID: Int,
    val listIndex: Int,
    val instTerm: String
) : SequentCalculusMove()
