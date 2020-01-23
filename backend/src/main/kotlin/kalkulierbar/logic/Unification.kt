package kalkulierbar.logic

import kalkulierbar.IllegalMove

/**
 * Implements functions for a first order unification
 */
class Unification {
    companion object Companion {

        /**
         * Unifies two given relations by using "Robinson’s Algorithm" (1963)
         * @param rel1 the first relation to be unified with rel2
         * @param rel2 the second relation to be unified with rel1
         * @return the map to resemble the executed substitutions
         */
        @Suppress("ThrowsCount", "ComplexMethod", "NestedBlockDepth")
        fun unificate(rel1: Relation, rel2: Relation): Map<String, FirstOrderTerm> {
            val arg1 = rel1.arguments
            val arg2 = rel2.arguments

            // Spelling has to be the same
            if (rel1.spelling != rel2.spelling)
                throw IllegalMove("Different Relations can't be unified")
            // Arg size has to be the same length
            if (arg1.size != arg2.size)
                throw IllegalMove("Relations have to be of the same size")

            val map = HashMap<String, FirstOrderTerm>()

            // As long as both relations aren't the same
            while (rel1 != rel2) {
                // Iterate over arguments of relation
                for (i in arg1.indices) {
                    val term1 = arg1[i]
                    val term2 = arg2[i]

                    // Go to next arg if equal
                    if (term1.toString() == term2.toString())
                        continue

                    // Checking variable existence
                    if (term1 is QuantifiedVariable) {
                        // Unification not possible if one is variable and appears in others arguments
                        if (term2 is Function && term1 in term2.arguments)
                            throw IllegalMove("Unification not possible. $term1 appears in $term2's arguments")

                        // Add substitution to map
                        map.put(term1.spelling, term2)
                    } else if (term2 is QuantifiedVariable) {
                        // Unification not possible if one is variable and appears in others arguments
                        if (term1 is Function && term2 in term1.arguments)
                            throw IllegalMove("Unification not possible. $term2 appears in $term1's arguments")

                        // Add substitution to map
                        map.put(term2.spelling, term1)
                    } else // At least one argument has to be a variable
                        throw IllegalMove("Unification not possible. Either one argument has to be " +
                                "a variable at position $i")

                    // Substitute relations with substitution
                    substituteRelation(rel1, map)
                    substituteRelation(rel2, map)
                    // Check substituted arguments after substitution from begin of list
                    break
                }
            }
            return map
        }

        /**
         * Substitutes all relation arguments with a given substitution mapping
         * @param rel the relation to execute the substitution
         * @param map the given substitution mapping
         */
        fun substituteRelation(rel: Relation, map: Map<String, FirstOrderTerm>) {
            val arguments = rel.arguments.toMutableList()

            for ((name, term) in map) {
                // substitute every matching argument
                for (i in arguments.indices) {
                    var arg = arguments[i]

                    // If arg is function then substitute function arguments
                    if (arg is Function)
                        substituteFunction(arg, map)

                    // If argument matches map-key, replace with map entry
                    else if (arg.toString() == name)
                        arguments[i] = term
                }
            }
        }

        /**
         * Substitutes all function arguments recursively with a given substitution mapping
         * @param func the function to execute the substitution
         * @param map the given substitution mapping
         */
        fun substituteFunction(func: Function, map: Map<String, FirstOrderTerm>) {
            val arguments = func.arguments.toMutableList()

            for ((name, term) in map) {
                // Substitute every matching argument
                for (i in arguments.indices) {
                    var arg = arguments[i]

                    // Recursively substitute all subfunction arguments
                    if (arg is Function)
                        substituteFunction(arg, map)

                    // If argument matches map-key, replace with map entry
                    else if (arg.toString() == name)
                        arguments[i] = term
                }
            }
        }
    }
}
