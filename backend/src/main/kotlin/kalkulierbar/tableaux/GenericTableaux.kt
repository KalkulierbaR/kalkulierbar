package kalkulierbar.tableaux

import kalkulierbar.clause.ClauseSet
import kalkulierbar.clause.Atom

interface GenericTableauxState<AtomType> {
    val type: TableauxType
    val regular: Boolean
    val backtracking: Boolean
    val usedBacktracking: Boolean

    val clauseSet: ClauseSet<AtomType>
    val nodes: List<GenericTableauxNode<AtomType>>
    val root
        get() = nodes[0]
    val leaves
        get() = nodes.filter { it.isLeaf }

    /**
     * Check whether a node is a (transitive) parent of another node
     * @param parentID Node to check parenthood of
     * @param childID Child node of suspected parent
     * @return true iff the parentID is a true ancestor of the childID
     */
    fun nodeIsParentOf(parentID: Int, childID: Int): Boolean {
        val child = nodes.get(childID)
        if (child.parent == parentID)
            return true
        if (child.parent == 0 || child.parent == null)
            return false
        return nodeIsParentOf(parentID, child.parent!!)
    }

    abstract fun nodeIsCloseable(nodeID: Int): Boolean

    abstract fun nodeIsDirectlyCloseable(nodeID: Int): Boolean
}

interface GenericTableauxNode<AtomType> {
    val parent: Int?
    val spelling: String
    val negated: Boolean
    var isClosed: Boolean
    var closeRef: Int?
    val children: MutableList<Int>
    val isLeaf: Boolean

    abstract fun toAtom(): Atom<AtomType>
}