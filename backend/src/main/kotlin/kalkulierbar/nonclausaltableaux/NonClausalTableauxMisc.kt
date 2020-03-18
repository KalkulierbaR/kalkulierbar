package kalkulierbar.nonclausaltableaux

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.transform.IdentifierCollector
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule

@Serializable
class NcTableauxState(
    val formula: LogicNode,
    val backtracking: Boolean = true
) : ProtectedState() {
    val nodes = mutableListOf<NcTableauxNode>(NcTableauxNode(null, formula))
    val moveHistory = mutableListOf<NcTableauxMove>()
    val identifiers = IdentifierCollector.collect(formula).toMutableSet()
    var usedBacktracking = false
    var gammaSuffixCounter = 0
    var skolemCounter = 0

    override var seal = ""

    /**
     * Check whether a node is a (transitive) parent of another node
     * @param parentID Node to check parenthood of
     * @param childID Child node of suspected parent
     * @return true iff the parentID is a true ancestor of the childID
     */
    @Suppress("ReturnCount")
    fun nodeIsParentOf(parentID: Int, childID: Int): Boolean {
        val child = nodes[childID]
        if (child.parent == parentID)
            return true
        if (child.parent == 0 || child.parent == null)
            return false
        return nodeIsParentOf(parentID, child.parent)
    }

    /**
     * Marks a tree node and its ancestry as closed
     * NOTE: This does NOT set the closeRef of the closed node
     *       so make sure the closeRef is set before calling this
     * @param nodeID The node to mark as closed
     */
    fun setClosed(nodeID: Int) {
        var node = nodes[nodeID]
        // Set isClosed to true for all nodes dominated by node in reverse tree
        while (node == nodes[nodeID] || node.children.fold(true) { acc, e -> acc && nodes[e].isClosed }) {
            node.isClosed = true
            if (node.parent == null)
                break
            node = nodes[node.parent!!]
        }
    }

    fun render() {
        nodes.forEach {
            it.render()
        }
    }

    override fun getHash(): String {
        val nodeH = nodes.joinToString(",") { it.getHash() }
        val historyH = moveHistory.joinToString(",")
        val identifiersH = identifiers.joinToString(",")
        val variousH = "$backtracking|$usedBacktracking|$gammaSuffixCounter|$skolemCounter|$formula"
        return "nctableaux|$variousH|$identifiersH|$nodeH|$historyH"
    }
}

@Serializable
class NcTableauxNode(
    val parent: Int?,
    var formula: LogicNode
) {

    var isClosed = false
    var closeRef: Int? = null
    val children = mutableListOf<Int>()
    var spelling = formula.toString()
    val isLeaf
        get() = children.size == 0

    override fun toString() = formula.toString()

    fun render() {
        spelling = formula.toString()
    }

    fun getHash() = "($parent|$children|$isClosed|$closeRef|$formula)"
}

@Serializable
abstract class NcTableauxMove

@Serializable
@SerialName("alpha")
class AlphaMove(val nodeID: Int) : NcTableauxMove() {
    override fun toString() = "(alpha|$nodeID)"
}

@Serializable
@SerialName("beta")
class BetaMove(val nodeID: Int) : NcTableauxMove() {
    override fun toString() = "(beta|$nodeID)"
}

@Serializable
@SerialName("gamma")
class GammaMove(val nodeID: Int) : NcTableauxMove() {
    override fun toString() = "(gamma|$nodeID)"
}

@Serializable
@SerialName("delta")
class DeltaMove(val nodeID: Int) : NcTableauxMove() {
    override fun toString() = "(delta|$nodeID)"
}

@Serializable
@SerialName("close")
class CloseMove(
        val nodeID: Int,
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

    override fun toString() = "(close|$nodeID|$closeID|$varAssign)"
}

@Serializable
@SerialName("undo")
class UndoMove : NcTableauxMove() {
    override fun toString() = "(undo)"
}

// Context object for move serialization
// Tells kotlinx.serialize about child types of NcTableauxMove
val NcMoveModule = SerializersModule {
    polymorphic(NcTableauxMove::class) {
        AlphaMove::class with AlphaMove.serializer()
        BetaMove::class with BetaMove.serializer()
        GammaMove::class with GammaMove.serializer()
        DeltaMove::class with DeltaMove.serializer()
        CloseMove::class with CloseMove.serializer()
        UndoMove::class with UndoMove.serializer()
    }
}
