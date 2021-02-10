package kalkulierbar.signedtableaux

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.parsers.FirstOrderParser
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
        NyMove::class with NyMove.serializer()
        PiMove::class with PiMove.serializer()
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
@SerialName("nyMove")
class NyMove(val nodeID: Int, val leafID: Int?) : SignedModalTableauxMove() {
    override fun toString() = "(nyMove|$nodeID)"
}

@Serializable
@SerialName("piMove")
class PiMove(val nodeID: Int, val leafID: Int?) : SignedModalTableauxMove() {
    override fun toString() = "(piMove|$nodeID)"
}

@Serializable
@SerialName("close")
class CloseMove(
    val nodeID: Int,
    val closeID: Int,
    val varAssign: Map<String, String>?
) : SignedModalTableauxMove() {
    /**
     * Parses map values to first-order terms
     * @return null iff varAssign == null
     *         parsed map-values iff varAssign != null
     */
    fun getVarAssignTerms(): Map<String, FirstOrderTerm>? {
        if (varAssign == null)
            return null
        return varAssign.mapValues {
            try {
                FirstOrderParser.parseTerm(it.value)
            } catch (e: InvalidFormulaFormat) {
                throw InvalidFormulaFormat("Could not parse term '${it.value}': ${e.message}")
            }
        }
    }

    override fun toString() = "(close|$nodeID|$closeID|$varAssign)"
}

@Serializable
@SerialName("undo")
class UndoMove : SignedModalTableauxMove() {
    override fun toString() = "(undo)"
}
