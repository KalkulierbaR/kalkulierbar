package kalkulierbar.resolution

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.parsers.FirstOrderParser
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.polymorphic
import kotlinx.serialization.modules.subclass

// Context object for move serialization
// Tells kotlinx.serialize about child types of ResolutionMove
val resolutionMoveModule = SerializersModule {
    polymorphic(ResolutionMove::class) {
        subclass(MoveResolve::class)
        subclass(MoveResolveUnify::class)
        subclass(MoveResolveCustom::class)
        subclass(MoveHide::class)
        subclass(MoveShow::class)
        subclass(MoveHyper::class)
        subclass(MoveFactorize::class)
    }
}

@Serializable
abstract class ResolutionMove

@Serializable
@SerialName("res-resolve")
data class MoveResolve(val c1: Int, val c2: Int, val literal: String?) : ResolutionMove()

@Serializable
@SerialName("res-resolveunify")
data class MoveResolveUnify(val c1: Int, val c2: Int, val l1: Int, val l2: Int) : ResolutionMove()

@Serializable
@SerialName("res-resolvecustom")
data class MoveResolveCustom(
    val c1: Int,
    val c2: Int,
    val l1: Int,
    val l2: Int,
    val varAssign: Map<String, String>,
) : ResolutionMove() {
    fun getVarAssignTerms() = varAssign.mapValues {
        try {
            FirstOrderParser.parseTerm(it.value)
        } catch (e: InvalidFormulaFormat) {
            throw InvalidFormulaFormat("Could not parse term '${it.value}': ${e.message}")
        }
    }
}

@Serializable
@SerialName("res-hide")
data class MoveHide(val c1: Int) : ResolutionMove()

@Serializable
@SerialName("res-show")
class MoveShow : ResolutionMove()

@Serializable
@SerialName("res-hyper")
data class MoveHyper(val mainID: Int, val atomMap: Map<Int, Pair<Int, Int>>) : ResolutionMove()

@Serializable
@SerialName("res-factorize")
data class MoveFactorize(val c1: Int, val atoms: List<Int>) : ResolutionMove()
