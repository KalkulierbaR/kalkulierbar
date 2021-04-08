package kalkulierbar.tests.tableaux

import kalkulierbar.tableaux.TableauxNode
import kalkulierbar.tableaux.TableauxState

// ApplyCose state creation helper function
fun createArtificialExpandState(nodes: List<TableauxNode>, state: TableauxState): TableauxState {
    state.tree.addAll(nodes)

    for (i in nodes.indices) {
        val parentThisNode = nodes[i].parent
        state.tree[parentThisNode!!].children.add(i + 1)
    }
    return state
}
