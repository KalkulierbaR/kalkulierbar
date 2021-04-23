package main.kotlin.kalkulierbar.tree

interface GenericTreeNode {
    var parent: Int?
    val children: MutableList<Int>

    val isLeaf: Boolean
        get() = children.isEmpty()
}
