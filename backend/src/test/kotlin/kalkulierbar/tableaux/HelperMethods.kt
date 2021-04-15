package kalkulierbar.tableaux

// ApplyCose state creation helper function
fun createArtificialExpandState(nodes: List<TableauxNode>, state: TableauxState): TableauxState {
    state.tree.addAll(nodes)

    for (i in nodes.indices) {
        val parentThisNode = nodes[i].parent
        state.tree[parentThisNode!!].children.add(i + 1)
    }
    return state
}
