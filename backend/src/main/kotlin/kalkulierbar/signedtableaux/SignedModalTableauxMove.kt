package kalkulierbar.signedtableaux

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule

// Context object for move serialization
// Tells kotlinx.serialize about child types of SignedModalTableaux
val SignedModalTablueaxMoveModule = SerializersModule {
    polymorphic(SignedModalTableauxMove::class) {
        Negation::class with Negation.serializer()
        AlphaMove::class with AlphaMove.serializer()
        BetaMove::class with BetaMove.serializer()
        NuMove::class with NuMove.serializer()
        PiMove::class with PiMove.serializer()
        Prune::class with Prune.serializer()
        CloseMove::class with CloseMove.serializer()
        UndoMove::class with UndoMove.serializer()
    }
}

@Serializable
abstract class SignedModalTableauxMove

@Serializable
@SerialName("negation")
class Negation(val nodeID: Int, val leafID: Int?) : SignedModalTableauxMove() {
    override fun toString() = "(negation|$nodeID)"
}

@Serializable
@SerialName("alphaMove")
class AlphaMove(val nodeID: Int, val leafID: Int?) : SignedModalTableauxMove() {
    override fun toString() = "(alphaMove|$nodeID)"
}

@Serializable
@SerialName("betaMove")
class BetaMove(val nodeID: Int, val leafID: Int?) : SignedModalTableauxMove() {
    override fun toString() = "(betaMove|$nodeID)"
}

@Serializable
@SerialName("nuMove")
class NuMove(val prefix: Int, val nodeID: Int, val leafID: Int?) : SignedModalTableauxMove() {
    override fun toString() = "(nuMove|$nodeID)"
}

@Serializable
@SerialName("piMove")
class PiMove(val prefix: Int, val nodeID: Int, val leafID: Int?) : SignedModalTableauxMove() {
    override fun toString() = "(piMove|$nodeID)"
}

@Serializable
@SerialName("prune")
class Prune(val nodeID: Int) : SignedModalTableauxMove() {
    override fun toString() = "(prune|$nodeID)"
}

@Serializable
@SerialName("close")
class CloseMove(val nodeID: Int, val leafID: Int) : SignedModalTableauxMove() {
    override fun toString() = "(close|$nodeID|$leafID)"
}

@Serializable
@SerialName("undo")
class UndoMove : SignedModalTableauxMove() {
    override fun toString() = "(undo)"
}
