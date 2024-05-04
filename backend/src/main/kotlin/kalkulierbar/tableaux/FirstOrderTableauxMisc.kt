package kalkulierbar.tableaux

import kalkulierbar.UnificationImpossible
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.Relation
import kalkulierbar.logic.transform.VariableInstantiator
import kalkulierbar.logic.transform.VariableSuffixAppend
import kalkulierbar.logic.util.Unification
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable

@Serializable
@Suppress("LongParameterList")
class FoTableauxState(
    override val clauseSet: ClauseSet<Relation>,
    val formula: String,
    override val type: TableauxType = TableauxType.UNCONNECTED,
    override val regular: Boolean = false,
    override val backtracking: Boolean = false,
    val manualVarAssign: Boolean = false
) : GenericTableauxState<Relation>, ProtectedState() {
    override val tree = mutableListOf(FoTableauxNode(null, Relation("true", listOf()), false))
    val moveHistory = mutableListOf<TableauxMove>()
    override var usedBacktracking = false
    var expansionCounter = 0

    override var seal = ""
    private var renderedClauseSet = listOf<String>()
    var statusMessage: String? = null

    /**
     * Check if a given node can be closed
     * @param nodeID ID of the node to check
     * @return true is the node can be closed, false otherwise
     */
    override fun nodeIsCloseable(nodeID: Int): Boolean {
        val node = tree[nodeID]
        return node.isLeaf && nodeAncestryContainsUnifiable(nodeID, node.toAtom())
    }

    /**
     * Check if a given node can be closed with its immediate parent
     * @param nodeID ID of the node to check
     * @return true is the node can be closed directly, false otherwise
     */
    override fun nodeIsDirectlyCloseable(nodeID: Int): Boolean {
        val node = tree[nodeID]
        if (node.parent == null || !node.isLeaf || node.negated == tree[node.parent].negated) {
            return false
        }
        val parent = tree[node.parent]

        return try {
            Unification.unify(node.relation, parent.relation)
            true
        } catch (e: UnificationImpossible) {
            false
        }
    }

    /**
     * The First-Order tableaux requires that variables introduced in a tree expansion
     * are fresh. Therefore, we add a suffix with the number of the current expansion
     * to every introduced variable.
     * @param clause Clause to be expanded
     * @return List of Atoms to be expanded with variables renamed to be fresh
     */
    override fun clauseExpandPreprocessing(clause: Clause<Relation>): List<Atom<Relation>> {
        val suffixAppender = VariableSuffixAppend("_${expansionCounter + 1}")
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
        var node = tree[nodeID]

        // Walk up the tree from start node
        while (node.parent != null) {
            node = tree[node.parent!!]
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
     * Apply a global variable instantiation in the proof tree
     * @param varAssign Map of which variables to replace with which terms
     * @return State with all occurrences of variables in the map replaced with their respective terms
     */
    fun applyVarInstantiation(varAssign: Map<String, FirstOrderTerm>) {
        val instantiator = VariableInstantiator(varAssign)

        tree.forEach { node ->
            node.relation.arguments = node.relation.arguments.map { it.accept(instantiator) }
        }
    }

    /**
     * Update properties of the state used for frontend representation
     */
    fun render() {
        renderedClauseSet = clauseSet.clauses.map { it.atoms.joinToString(", ") }
        tree.forEach {
            it.render()
        }
    }

    override fun getHash(): String {
        val nodesHash = tree.joinToString("|") { it.getHash() }
        val clauseSetHash = clauseSet.toString()
        val optsHash = "$type|$regular|$backtracking|$usedBacktracking|$manualVarAssign"
        val variousHash = "$formula|$expansionCounter"
        val historyHash = moveHistory.joinToString(",")
        return "fotableaux|$variousHash|$optsHash|$clauseSetHash|[$nodesHash]|[$historyHash]"
    }
}

/**
 * Class representing a single node in the proof tree
 * @param parent ID of the parent node in the proof tree
 * @param relation Name of the relation the node represents
 * @param negated True if the relation is negated, false otherwise
 * @param lemmaSource Marks the node as created using a Lemma rule instantiation
 */
@Serializable
class FoTableauxNode(
    override val parent: Int?,
    val relation: Relation,
    override val negated: Boolean,
    override val lemmaSource: Int? = null,
) : GenericTableauxNode<Relation> {

    override var isClosed = false
    override var closeRef: Int? = null
    override val children = mutableListOf<Int>()
    override var spelling = relation.toString()

    override val literalStem
        get() = "${relation.spelling}${relation.arguments.size}"

    override fun toString(): String {
        return if (negated) "!$relation" else "$relation"
    }

    override fun toAtom() = Atom(relation.clone(), negated)

    fun render() {
        spelling = relation.toString()
    }

    /**
     * Pack the node into a well-defined, unambiguous string representation
     * Used to calculate checksums over state objects as JSON representation
     * might differ slightly between clients, encodings, etc
     * Note: isLemma is only relevant to the visual representation of the proof,
     *       not the proof correctness or structure itself. It is thus deliberately
     *       not included in the node hash.
     * @return Canonical node representations
     */
    fun getHash(): String {
        val neg = if (negated) "n" else "p"
        val closed = if (isClosed) "c" else "o"
        val ref = if (closeRef != null) closeRef.toString() else "-"
        val childList = children.joinToString(",")
        return "$relation;$neg;$parent;$ref;$closed;($childList)"
    }
}

@Serializable
data class FoTableauxParam(
    val type: TableauxType,
    val regular: Boolean,
    val backtracking: Boolean,
    val manualVarAssign: Boolean,
)
