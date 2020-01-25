package kalkulierbar.logic.transform

import kalkulierbar.UnificationImpossible
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.Function
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Relation

/**
 * Implements functions for a first order unification
 */
class Unification {
    companion object {

        /**
         * Unifies two given relations by using "Robinson's Algorithm" (1963)
         * @param r1 the first relation to be unified with r2
         * @param r2 the second relation to be unified with r1
         * @return a map of the executed substitutions
         */
        fun unify(r1: Relation, r2: Relation): Map<String, FirstOrderTerm> {
            var rel1 = r1
            var rel2 = r2
            val arg1 = rel1.arguments
            val arg2 = rel2.arguments

            // Spelling has to be the same
            if (rel1.spelling != rel2.spelling)
                throw UnificationImpossible("Relations '$r1' and '$r2' have different names")
            // Arg size has to be the same length
            if (arg1.size != arg2.size)
                throw UnificationImpossible("Relations '$r1' and '$r2' have different numbers of arguments")

            val terms = mutableListOf<Pair<FirstOrderTerm, FirstOrderTerm>>()

            for (i in arg1.indices)
                terms.add(Pair(arg1[i], arg2[i]))

            return unifyTerms(terms)
        }

        /**
         * Unify a set of term pairs according to Robinson's algorithm
         * @param terms List of term pairs to be unified
         * @return Variable instantiation map
         */
        @Suppress("ComplexMethod")
        private fun unifyTerms(terms: MutableList<Pair<FirstOrderTerm, FirstOrderTerm>>): Map<String, FirstOrderTerm> {
            val map = mutableMapOf<String, FirstOrderTerm>()

            // As long as both relations aren't the same
            while (terms.isNotEmpty()) {

                var (term1, term2) = terms.removeAt(0)

                // Apply gathered substitutions just-in-time
                term1 = VariableInstantiator.transform(term1, map)
                term2 = VariableInstantiator.transform(term2, map)

                // Skip terms if already equal
                if (term1 == term2) {
                    continue
                } else if (term1 is QuantifiedVariable) {
                    // Unification not possible if one is variable and appears in others arguments
                    if (term2 is Function && TermContainsVariable.check(term2, term1.spelling))
                        throw UnificationImpossible("Variable '$term1' appears in '$term2'")

                    // Add substitution to map
                    map.put(term1.spelling, term2)
                } else if (term2 is QuantifiedVariable) {
                    // Swap them around to be processed later
                    terms.add(Pair(term2, term1))
                } else if (term1 is Function && term2 is Function && term1.spelling == term2.spelling && term1.arguments.size == term2.arguments.size) {
                    // Break down into subterms
                    for (i in term1.arguments.indices)
                        terms.add(Pair(term1.arguments[i], term2.arguments[i]))
                } else
                    throw UnificationImpossible("'$term1' and '$term2' cannot be unified")
            }
            return map
        }
    }
}
