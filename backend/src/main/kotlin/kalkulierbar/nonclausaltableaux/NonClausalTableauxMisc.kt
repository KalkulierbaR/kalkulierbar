package kalkulierbar.nonclausaltableaux

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.LogicNode
import kalkulierbar.parsers.FirstOrderParser
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
    var expansionCounter = 0

    override var seal = ""

    /**
     * Check whether a node is a (transitive) parent of another node
     * @param parentID Node to check parenthood of
     * @param childID Child node of suspected parent
     * @return true iff the parentID is a true ancestor of the childID
     */
    @Suppress("ReturnCount")
    fun nodeIsParentOf(parentID: Int, childID: Int): Boolean {
        val child = nodes.get(childID)
        if (child.parent == parentID)
            return true
        if (child.parent == 0 || child.parent == null)
            return false
        return nodeIsParentOf(parentID, child.parent)
    }

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
    val isLeaf = children.size == 0

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
) : NcTableauxMove() {
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
}

@Serializable
@SerialName("undo")
class UndoMove : NcTableauxMove()
