package kalkulierbar.psc

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.parsers.FirstOrderParser
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule

// Context object for move serialization
// Tells kotlinx.serialize about child types of NcTableauxMove
val PSCMoveModule = SerializersModule {
    polymorphic(PSCMove::class) {
        AlphaMove::class with AlphaMove.serializer()
        BetaMove::class with BetaMove.serializer()
        GammaMove::class with GammaMove.serializer()
        DeltaMove::class with DeltaMove.serializer()
        CloseMove::class with CloseMove.serializer()
        UndoMove::class with UndoMove.serializer()
    }
}

@Serializable
abstract class PSCMove

@Serializable
@SerialName("alpha")
class AlphaMove(val nodeID: Int) : PSCMove() {
    override fun toString() = "(alpha|$nodeID)"
}

@Serializable
@SerialName("beta")
class BetaMove(val nodeID: Int) : PSCMove() {
    override fun toString() = "(beta|$nodeID)"
}

@Serializable
@SerialName("gamma")
class GammaMove(val nodeID: Int) : PSCMove() {
    override fun toString() = "(gamma|$nodeID)"
}

@Serializable
@SerialName("delta")
class DeltaMove(val nodeID: Int) : PSCMove() {
    override fun toString() = "(delta|$nodeID)"
}

@Serializable
@SerialName("close")
class CloseMove(
        val nodeID: Int,
        val closeID: Int,
        val varAssign: Map<String, String>?
) : PSCMove() {
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
class UndoMove : PSCMove() {
    override fun toString() = "(undo)"
}
