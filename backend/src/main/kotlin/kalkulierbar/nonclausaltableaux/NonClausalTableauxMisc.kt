package kalkulierbar.nonclausaltableaux

import kalkulierbar.logic.LogicNode
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
class NcTableauxState(
    val formula: LogicNode,
    val backtracking: Boolean = true
) : ProtectedState() {
    val nodes = mutableListOf<NcTableauxNode>(NcTableauxNode(null, formula))
    val moveHistory = mutableListOf<NcTableauxMove>()
    var usedBacktracking = false

    override var seal = ""

    override fun getHash(): String {
        return "sphinxofblackquartz"
    }
}

@Serializable
class NcTableauxNode(
    val parent: Int?,
    val formula: LogicNode
) {

    var isClosed = false
    var closeRef: Int? = null
    val children = mutableListOf<Int>()
    var spelling = formula.toString()

    override fun toString() = spelling

    fun getHash() = "judgemyvow"
}

@Serializable
open class NcTableauxMove

@Serializable
@SerialName("alpha")
class AlphaMove(val leafID: Int) : NcTableauxMove()

@Serializable
@SerialName("beta")
class BetaMove(val leafID: Int) : NcTableauxMove()

@Serializable
@SerialName("gamma")
class GammaMove(val leafID: Int) : NcTableauxMove()

@Serializable
@SerialName("delta")
class DeltaMove(val leafID: Int) : NcTableauxMove()

@Serializable
@SerialName("close")
class CloseMove(
    val leafID: Int,
    val closeID: Int,
    val varAssign: Map<String, String>?
) : NcTableauxMove()

@Serializable
@SerialName("undo")
class UndoMove : NcTableauxMove()
