package kalkulierbar.tableaux

import kalkulierbar.UnificationImpossible
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.Relation
import kalkulierbar.logic.transform.Unification
import kalkulierbar.logic.transform.VariableSuffixAppend
import kalkulierbar.parsers.FirstOrderParser
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable

@Serializable
class FoTableauxState(
    override val clauseSet: ClauseSet<Relation>,
    val formula: String,
    override val type: TableauxType = TableauxType.UNCONNECTED,
    override val regular: Boolean = false,
    override val backtracking: Boolean = false,
    val manualVarAssign: Boolean = false
) : GenericTableauxState<Relation>, ProtectedState() {
    override val nodes = mutableListOf<FoTableauxNode>(FoTableauxNode(null, Relation("true", listOf()), false))
    val moveHistory = mutableListOf<FoTableauxMove>()
    override var usedBacktracking = false
    var expansionCounter = 0

    override var seal = ""
    var renderedClauseSet = listOf<String>()

    /**
     * Check if a given node can be closed
     * @param nodeID ID of the node to check
     * @return true is the node can be closed, false otherwise
     */
    override fun nodeIsCloseable(nodeID: Int): Boolean {
        val node = nodes.get(nodeID)
        return node.isLeaf && nodeAncestryContainsUnifiable(nodeID, node.toAtom())
    }

    /**
     * Check if a given node can be closed with its immediate parent
     * @param nodeID ID of the node to check
     * @return true is the node can be closed directly, false otherwise
     */
    override fun nodeIsDirectlyCloseable(nodeID: Int): Boolean {
        val node = nodes[nodeID]
        if (node.parent == null || !node.isLeaf || node.negated == nodes[node.parent].negated)
            return false
        val parent = nodes[node.parent]

        var res: Boolean

        try {
            Unification.unify(node.relation, parent.relation)
            res = true
        } catch (e: UnificationImpossible) {
            res = false
        }

        return res
    }

    /**
     * The First-Order tableaux requires that variables introduced in a tree expansion
     * are fresh. Therefore, we add a suffix with the number of the current expansion
     * to every introduced variable.
     * @param clause Clause to be expanded
     * @return List of Atoms to be expanded with variables renamed to be fresh
     */
    // TODO: Does this actually ensure the required level of freshness?
    // Would it cause problems if I could instantiate 'Xv1' with 'Xv2', then expand again, causing
    // another Xv2 to be generated? Does this scenario have to be avoided?
    override fun clauseExpandPreprocessing(clause: Clause<Relation>): List<Atom<Relation>> {
        val suffixAppender = VariableSuffixAppend("v${expansionCounter + 1}")
        val atomList = mutableListOf<Atom<Relation>>()

        // Adding every atom in clause to leaf and set parameters
        for (atom in clause.atoms) {
            val newargs = atom.lit.arguments.map { it.clone().accept(suffixAppender) }
            val relation = Relation(atom.lit.spelling, newargs)
            atomList.add(Atom(relation, atom.negated))
        }

        return atomList
    }

    /**
     * Search the ancestry of a tree node for a node that can be unified with the given atom
     * @param nodeID Node to search ancestry of
     * @param atom Atom to find unification partner for
     * @return true iff the ancestry contains a suitable unification partner
     */
    @Suppress("EmptyCatchBlock")
    private fun nodeAncestryContainsUnifiable(nodeID: Int, atom: Atom<Relation>): Boolean {
        var node = nodes[nodeID]

        // Walk up the tree from start node
        while (node.parent != null) {
            node = nodes[node.parent!!]
            // Check if current node can be unified with given atom
            if (node.negated != atom.negated && node.relation.spelling == atom.lit.spelling) {
                try {
                    Unification.unify(node.relation, atom.lit)
                    return true
                } catch (e: UnificationImpossible) {}
            }
        }

        return false
    }

    /**
     * Update properties of the state used for frontend representation
     */
    fun render() {
        renderedClauseSet = clauseSet.clauses.map { it.atoms.joinToString(", ") }
        nodes.forEach {
            it.render()
        }
    }

    override fun getHash(): String {
        val nodesHash = nodes.joinToString("|") { it.getHash() }
        val clauseSetHash = clauseSet.toString()
        val optsHash = "$type|$regular|$backtracking|$usedBacktracking|$manualVarAssign"
        val variousHash = "$formula|$expansionCounter"
        val historyHash = moveHistory.map { "(${it.type},${it.id1},${it.id2},${it.varAssign})" }.joinToString(",")
        return "fotableaux|$variousHash|$optsHash|$clauseSetHash|[$nodesHash]|[$historyHash]"
    }
}

/**
 * Class representing a single node in the proof tree
 * @param parent ID of the parent node in the proof tree
 * @param spelling Name of the variable the node represents
 * @param negated True if the variable is negated, false otherwise
 */
@Serializable
class FoTableauxNode(
    override val parent: Int?,
    val relation: Relation,
    override val negated: Boolean
) : GenericTableauxNode<Relation> {

    override var isClosed = false
    override var closeRef: Int? = null
    override val children = mutableListOf<Int>()
    override var spelling = relation.toString()
    override val isLemma = false

    override val literalStem
        get() = "${relation.spelling}${relation.arguments.size}"

    override fun toString(): String {
        return if (negated) "!$relation" else "$relation"
    }

    override fun toAtom() = Atom(relation, negated)

    fun render() {
        spelling = relation.toString()
    }

    /**
     * Pack the node into a well-defined, unambiguous string representation
     * Used to calculate checksums over state objects as JSON representation
     * might differ slightly between clients, encodings, etc
     * @return Canonical node representations
     */
    fun getHash(): String {
        val neg = if (negated) "n" else "p"
        val closed = if (isClosed) "c" else "o"
        val ref = if (closeRef != null) closeRef.toString() else "-"
        val childlist = children.joinToString(",")
        return "$relation;$neg;$parent;$ref;$closed;($childlist)"
    }
}

@Serializable
data class FoTableauxMove(
    val type: FoMoveType,
    val id1: Int,
    val id2: Int,
    val varAssign: Map<String, String> = mapOf()
) {
    fun getVarAssignTerms() = varAssign.mapValues { FirstOrderParser.parseTerm(it.value) }
}

@Serializable
data class FoTableauxParam(
    val type: TableauxType,
    val regular: Boolean,
    val backtracking: Boolean,
    val manualVarAssign: Boolean
)

enum class FoMoveType {
    EXPAND, CLOSE, AUTOCLOSE, UNDO
}
