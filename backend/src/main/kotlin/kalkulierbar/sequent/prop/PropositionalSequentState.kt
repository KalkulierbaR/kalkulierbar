package kalkulierbar.sequent.prop

import kalkulierbar.sequent.GenericSequentCalculusState
import kalkulierbar.sequent.TreeNode
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable

@Serializable
class PropositionalSequentState(
    override val tree: MutableList<TreeNode> = mutableListOf(),
    override var showOnlyApplicableRules: Boolean = false
) : GenericSequentCalculusState, ProtectedState() {
    override var seal = ""

    override fun getHash(): String {
        return "psc|${tree.joinToString()}|$showOnlyApplicableRules"
    }
}
