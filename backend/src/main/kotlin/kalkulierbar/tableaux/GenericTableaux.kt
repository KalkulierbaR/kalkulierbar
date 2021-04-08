package kalkulierbar.tableaux

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.clause.ClauseSet

/**
 * Interface defining common methods useful for both Propositional
 * and First Order tableaux calculi
 */
interface GenericTableaux<AtomType>

/**
 * Interface for a generic/common tableaux state
 * Methods and properties defined here should be sufficient
 * to use the methods provided by the GenericTableaux interface
 */
interface GenericTableauxState<AtomType> {
    val type: TableauxType
    val regular: Boolean
    val backtracking: Boolean
    val usedBacktracking: Boolean

    val clauseSet: ClauseSet<AtomType>
    val tree: List<GenericTableauxNode<AtomType>>
    val root
        get() = tree[0]

    /**
     * Check whether a node is a (transitive) parent of another node
     * @param parentID Node to check parenthood of
     * @param childID Child node of suspected parent
     * @return true iff the parentID is a true ancestor of the childID
     */
    @Suppress("ReturnCount")
    fun nodeIsParentOf(parentID: Int, childID: Int): Boolean {
        val child = tree[childID]
        if (child.parent == parentID)
            return true
        if (child.parent == 0 || child.parent == null)
            return false
        return nodeIsParentOf(parentID, child.parent!!)
    }

    /**
     * Marks a tree node and its ancestry as closed
     * NOTE: This does NOT set the closeRef of the closed leaf
     *       so make sure the closeRef is set before calling this
     * @param leaf The leaf to mark as closed
     */
    fun setNodeClosed(leaf: GenericTableauxNode<AtomType>) {
        var node = leaf

        // Set isClosed to true for all nodes dominated by leaf in reverse tree
        while (node.isLeaf || node.children.fold(true) { acc, e -> acc && tree[e].isClosed }) {
            node.isClosed = true
            if (node.parent == null)
                break
            node = tree[node.parent!!]
        }
    }

    /**
     * Generates a CloseMessage stating whether the proof is closed and, if so,
     * what type of tableaux the proof is valid in
     * @return CloseMessage explaining the proof state
     */
    fun getCloseMessage(): CloseMessage {
        var msg = "The proof tree is not closed"

        if (root.isClosed) {
            var connectedness = "unconnected"
            if (checkConnectedness(this, TableauxType.STRONGLYCONNECTED))
                connectedness = "strongly connected"
            else if (checkConnectedness(this, TableauxType.WEAKLYCONNECTED))
                connectedness = "weakly connected"

            val regularity = if (checkRegularity(this)) "regular " else ""
            val withWithoutBT = if (usedBacktracking) "with" else "without"

            msg = "The proof is closed and valid in a $connectedness ${regularity}tableaux $withWithoutBT backtracking"
        }

        return CloseMessage(root.isClosed, msg)
    }

    /**
     * Ensures that conditions for a lemma rule application are met
     * and determines the atom that should be appended as part of the lemma rule
     * If a precondition is not met, an explaining exception will be thrown
     * Conditions include:
     *  - Both leafID and lemmaID reference existing nodes
     *  - The references leaf is an open leaf, the referenced node is closed
     *  - The referenced leaf and node are siblings (the ancestry of the node is included in the ancestry of the leaf)
     *  - Appending the lemma would not violate regularity restrictions
     *
     * @param leafID Node to append created lemma on
     * @param lemmaID Node to create lemma from
     * @return Atom representing the lemma node to be appended to the leaf
     */
    @Suppress("ThrowsCount", "ComplexMethod")
    fun getLemma(leafID: Int, lemmaID: Int): Atom<AtomType> {
        // Verify that subtree root for lemma creation exists
        if (lemmaID >= tree.size || lemmaID < 0)
            throw IllegalMove("Node with ID $lemmaID does not exist")
        // Verify that subtree root for lemma creation exists
        if (leafID >= tree.size || leafID < 0)
            throw IllegalMove("Node with ID $leafID does not exist")

        val leaf = tree[leafID]
        val lemmaNode = tree[lemmaID]

        if (!leaf.isLeaf)
            throw IllegalMove("Node '$leaf' is not a leaf")

        if (leaf.isClosed)
            throw IllegalMove("Leaf '$leaf' is already closed")

        if (!lemmaNode.isClosed)
            throw IllegalMove("Node '$lemmaNode' is not the root of a closed subtableaux")

        if (lemmaNode.parent == null)
            throw IllegalMove("Root node cannot be used for lemma creation")

        if (lemmaNode.isLeaf)
            throw IllegalMove("Cannot create lemma from a leaf")

        val commonParent: Int = lemmaNode.parent!!

        if (!nodeIsParentOf(commonParent, leafID))
            throw IllegalMove("Nodes '$leaf' and '$lemmaNode' are not siblings")

        val atom = lemmaNode.toAtom().not()

        // Verify compliance with regularity criteria
        if (regular)
            verifyExpandRegularity(this, leafID, Clause(mutableListOf(atom)), applyPreprocessing = false)

        return atom
    }

    fun nodeIsCloseable(nodeID: Int): Boolean

    fun nodeIsDirectlyCloseable(nodeID: Int): Boolean

    fun clauseExpandPreprocessing(clause: Clause<AtomType>): List<Atom<AtomType>>
}

/**
 * Interface for a generic/common tableaux node
 * Methods and properties defined here should be sufficient
 * to use the methods provided by the GenericTableaux interface
 */
interface GenericTableauxNode<AtomType> {
    val parent: Int?
    val spelling: String
    val literalStem: String
    val negated: Boolean
    var isClosed: Boolean
    var closeRef: Int?
    val children: MutableList<Int>
    val lemmaSource: Int?
    val isLeaf
        get() = children.size == 0

    fun toAtom(): Atom<AtomType>
}
