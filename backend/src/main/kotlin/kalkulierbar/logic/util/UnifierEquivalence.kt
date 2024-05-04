package kalkulierbar.logic.util

import kalkulierbar.UnificationImpossible
import kalkulierbar.logic.Constant
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.Function
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Relation
import kalkulierbar.logic.transform.FirstOrderTermVisitor

class UnifierEquivalence {
    companion object {

        /**
         * Checks if a given unifier an MGU
         * Note: This will ALSO return true if there is no MGU for the given relations
         * @param unifier Suspected MGU of r1 and r2
         * @param r1 First Relation to unify
         * @param r2 Second Relation to unify
         * @return true iff the unifier is an MGU or no MGU exists for the given relations
         */
        fun isMGUorNotUnifiable(unifier: Map<String, FirstOrderTerm>, r1: Relation, r2: Relation): Boolean {
            val mgu: Map<String, FirstOrderTerm>

            try {
                mgu = Unification.unify(r1, r2)
            } catch (e: UnificationImpossible) {
                // Relations are not unifiable
                return true
            }

            return equiv(mgu, unifier)
        }

        /**
         * Checks if two unifiers are equal up to variable renamings
         * Variables missing from either unifier are interpreted as identity assignments
         * @param u1 First unifier
         * @param u2 Second unifier
         * @return true iff a variable renaming scheme exists under which u1 and u2 are equal
         */
        fun equiv(u1: Map<String, FirstOrderTerm>, u2: Map<String, FirstOrderTerm>): Boolean {
            val termPairs = mutableListOf<Pair<FirstOrderTerm, FirstOrderTerm>>()
            val keys = u1.keys.union(u2.keys)

            // Build list of equivalent terms from both unifiers
            // assuming identity where no assignment is given
            keys.forEach {
                val term1 = (u1[it] ?: QuantifiedVariable(it)).clone()
                val term2 = (u2[it] ?: QuantifiedVariable(it)).clone()
                termPairs.add(Pair(term1, term2))
            }

            // Check if the unifiers are equal using canonical variable names
            val canonicalTerms = canonicalVarNames(termPairs)
            return canonicalTerms.all { it.first.synEq(it.second) }
        }

        /**
         * Renames variables in a list of terms to their canonical names
         * @param list List of pairs of terms to rename
         * @return List of pairs of terms with canonical names applied
         */
        private fun canonicalVarNames(
            list: List<Pair<FirstOrderTerm, FirstOrderTerm>>,
        ): List<Pair<FirstOrderTerm, FirstOrderTerm>> {
            val canon1 = VariableCanonicizer()
            val canon2 = VariableCanonicizer()

            return list.map {
                Pair(it.first.accept(canon1), it.second.accept(canon2))
            }
        }
    }
}

/**
 * Re-names variables in a term in a deterministic manner
 * Variable names will be consistent across multiple invocations on the same instance
 * WARNING: This assumes syntactically equal Variables do indeed reference the same
 *          variable across invocations. Apply UniqueVariables before using this if you
 *          are unsure whether this might be a problem.
 */
class VariableCanonicizer : FirstOrderTermVisitor<FirstOrderTerm>() {

    private var counter = 0
    private val replacements = mutableMapOf<String, String>()

    // Re-name encountered Variables
    override fun visit(node: QuantifiedVariable): FirstOrderTerm {
        // If we haven't seen this variable before, assign a new name
        if (replacements[node.spelling] == null) {
            counter++
            replacements[node.spelling] = "V-$counter"
        }

        node.spelling = replacements[node.spelling]!!
        return node
    }

    // Do nothing
    override fun visit(node: Constant) = node

    // Apply transformation on sub-terms
    override fun visit(node: Function): FirstOrderTerm {
        node.arguments = node.arguments.map { it.accept(this) }

        return node
    }
}
