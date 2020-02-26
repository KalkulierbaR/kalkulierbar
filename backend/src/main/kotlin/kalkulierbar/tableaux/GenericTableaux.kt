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
interface GenericTableaux<AtomType> {

    /**
     * Marks a tree node and its ancestry as closed
     * NOTE: This does NOT set the closeRef of the closed leaf
     *       so make sure the closeRef is set before calling this
     * @param state State object to modify
     * @param leaf The leaf to mark as closed
     */
    fun setNodeClosed(state: GenericTableauxState<AtomType>, leaf: GenericTableauxNode<AtomType>) {
        var node = leaf

        // Set isClosed to true for all nodes dominated by leaf in reverse tree
        while (node.isLeaf || node.children.fold(true) { acc, e -> acc && state.nodes[e].isClosed }) {
            node.isClosed = true
            if (node.parent == null)
                break
            node = state.nodes[node.parent!!]
        }
    }

    /**
     * Ensure the basic sanity of an expand move application
     * If a condition is not met, an explaining exception will be thrown
     * Conditions include:
     *  - Both the specified leaf and clause exist
     *  - The specified leaf is a leaf and not already closed
     *  - Expanding the specified clause at the leaf would not violate regularity
     * @param state State the expansion is to be applied in
     * @param leafID The leaf to expand
     * @param clauseID The clause to expand at the leaf
     */
    @Suppress("ThrowsCount")
    fun ensureExpandability(state: GenericTableauxState<AtomType>, leafID: Int, clauseID: Int) {
        // Don't allow further expand moves if connectedness requires close moves to be applied first
        if (!checkConnectedness(state, state.type))
            throw IllegalMove("The proof tree is currently not sufficiently connected, " +
                    "please close branches first to restore connectedness before expanding more leaves")

        // Verify that both leaf and clause are valid
        if (leafID >= state.nodes.size || leafID < 0)
            throw IllegalMove("Node with ID $leafID does not exist")
        if (clauseID >= state.clauseSet.clauses.size || clauseID < 0)
            throw IllegalMove("Clause with ID $clauseID does not exist")

        val leaf = state.nodes[leafID]
        val clause = state.clauseSet.clauses[clauseID]

        // Verify that leaf is actually a leaf
        if (!leaf.isLeaf)
            throw IllegalMove("Node '$leaf' is not a leaf")

        if (leaf.isClosed)
            throw IllegalMove("Node '$leaf' is already closed")

        // Move should be compatible with regularity restriction
        if (state.regular)
            verifyExpandRegularity(state, leafID, clause)
    }

    /**
     * Ensures that basic conditions for branch closure are met
     * If a condition is not met, an explaining exception will be thrown
     * Conditions inlcude:
     *  - Both nodes exist
     *  - The specified leaf is a leaf and not yet closed
     *  - Both nodes share the same literal stem (variable name or relation name)
     *  - The nodes are of opposite polarity
     *  - The closeNode is an ancestor of the leaf
     *
     * @param state State to apply close move in
     * @param leafID Leaf to close
     * @param closeNodeID Node to close with
     */
    @Suppress("ComplexMethod", "ThrowsCount")
    fun ensureBasicCloseability(state: GenericTableauxState<AtomType>, leafID: Int, closeNodeID: Int) {
        // Verify that both leaf and closeNode are valid nodes
        if (leafID >= state.nodes.size || leafID < 0)
            throw IllegalMove("Node with ID $leafID does not exist")
        if (closeNodeID >= state.nodes.size || closeNodeID < 0)
            throw IllegalMove("Node with ID $closeNodeID does not exist")

        val leaf = state.nodes[leafID]
        val closeNode = state.nodes[closeNodeID]

        // Verify that leaf is actually a leaf
        if (!leaf.isLeaf)
            throw IllegalMove("Node '$leaf' is not a leaf")

        // Verify that leaf is not already closed
        if (leaf.isClosed)
            throw IllegalMove("Leaf '$leaf' is already closed, no need to close again")

        // Verify that leaf and closeNode reference the same literal
        if (leaf.literalStem != closeNode.literalStem)
            throw IllegalMove("Leaf '$leaf' and node '$closeNode' do not reference the same literal")

        // Verify that negation checks out
        if (leaf.negated == closeNode.negated) {
            val noneOrBoth = if (leaf.negated) "both of them" else "neither of them"
            val msg = "Leaf '$leaf' and node '$closeNode' reference the same literal, but $noneOrBoth are negated"
            throw IllegalMove(msg)
        }

        // Ensure that tree root node cannot be used to close literals of same spelling ('true')
        if (closeNodeID == 0)
            throw IllegalMove("The root node cannot be used for branch closure")

        // Verify that closeNode is transitive parent of leaf
        if (!state.nodeIsParentOf(closeNodeID, leafID))
            throw IllegalMove("Node '$closeNode' is not an ancestor of leaf '$leaf'")
    }

    /**
     * Generates a CloseMessage stating whether the proof is closed and, if so,
     * what type of tableaux the proof is valid in
     * @param State to generate message for
     * @return CloseMessage explaining the proof state
     */
    fun getCloseMessage(state: GenericTableauxState<AtomType>): CloseMessage {
        var msg = "The proof tree is not closed"

        if (state.root.isClosed) {
            var connectedness = "unconnected"
            if (checkConnectedness(state, TableauxType.STRONGLYCONNECTED))
                connectedness = "strongly connected"
            else if (checkConnectedness(state, TableauxType.WEAKLYCONNECTED))
                connectedness = "weakly connected"

            val regularity = if (checkRegularity(state)) "regular " else ""
            val withWithoutBT = if (state.usedBacktracking) "with" else "without"

            msg = "The proof is closed and valid in a $connectedness ${regularity}tableaux $withWithoutBT backtracking"
        }

        return CloseMessage(state.root.isClosed, msg)
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
     * @param state State to apply lemma move in
     * @param leafID Node to append created lemma on
     * @param lemmaID Node to create lemma from
     * @return Atom representing the lemma node to be appended to the leaf
     */
    @Suppress("ThrowsCount")
    fun getLemma(state: GenericTableauxState<AtomType>, leafID: Int, lemmaID: Int): Atom<AtomType> {
        // Verify that subtree root for lemma creation exists
        if (lemmaID >= state.nodes.size || lemmaID < 0)
            throw IllegalMove("Node with ID $lemmaID does not exist")
            // Verify that subtree root for lemma creation exists
        if (leafID >= state.nodes.size || leafID < 0)
            throw IllegalMove("Node with ID $leafID does not exist")

        val leaf = state.nodes[leafID]
        val lemmaNode = state.nodes[lemmaID]

        if (!leaf.isLeaf)
            throw IllegalMove("Node '$leaf' is not a leaf")

        if (leaf.isClosed)
            throw IllegalMove("Leaf '$leaf' is already closed")

        if (!lemmaNode.isClosed)
            throw IllegalMove("Node '$lemmaNode' is not the root of a closed subtableaux")

        if (lemmaNode.parent == null)
            throw IllegalMove("Root node cannot be used for lemma creation")

        val commonParent: Int = lemmaNode.parent!!

        // ATTENTION: Muss vielleicht abgeändert werden
        if (!state.nodeIsParentOf(commonParent, leafID))
            throw IllegalMove("Nodes '$leaf' and '$lemmaNode' are not siblings")

        val atom = lemmaNode.toAtom().not()

        // Verify compliance with regularity criteria
        // TODO: this assumes FO lemmas will not be preprocessed like regular clause expansions
        // I have no idea if that is actually the case
        if (state.regular)
            verifyExpandRegularity(state, leafID, Clause(mutableListOf(atom)), applyPreprocessing = false)

        return atom
    }
}

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
    val nodes: List<GenericTableauxNode<AtomType>>
    val root
        get() = nodes[0]

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
        return nodeIsParentOf(parentID, child.parent!!)
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
