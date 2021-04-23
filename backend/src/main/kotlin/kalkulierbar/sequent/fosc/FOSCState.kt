package kalkulierbar.sequent.fosc

import kalkulierbar.sequent.GenericSequentCalculusState
import kalkulierbar.sequent.TreeNode
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable

@Serializable
class FOSCState(
    override val tree: MutableList<TreeNode> = mutableListOf(),
    override var showOnlyApplicableRules: Boolean = false
) : GenericSequentCalculusState, ProtectedState() {
    override var seal = ""

    override fun getHash(): String {
        return "fosc|${tree.joinToString()}|$showOnlyApplicableRules"
    }
}
