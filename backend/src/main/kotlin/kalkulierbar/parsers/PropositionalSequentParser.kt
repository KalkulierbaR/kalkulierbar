package kalkulierbar.parsers

import kalkulierbar.EmptyFormulaException
import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.transform.ChangeEquivalences

object PropositionalSequentParser {

    /**
     * Parses a string directly into a PSCState using the PropositionalParser
     * to parse single formulas separated by ',' in the input string
     * and seperated by '|-' to differentiate between left and right side;
     */
    fun parse(formula: String): Pair<List<LogicNode>, List<LogicNode>> {
        // Find left and right formulas in the input string
        val sides = formula.split("|-")

        // If there is more than one '|-' in the input sting throw an error
        return when {
            sides.size > 2 -> {
                val i = sides[0].length + 2 + sides[1].length // position of first extra '|-' symbol
                throw InvalidFormulaFormat("Incorrect formula syntax at char $i")
            }
            // The Input String consists of exactly one '|-'
            sides.size == 2 -> {
                val leftFormulas = parseFormulas(sides[0], 0)
                val rightFormulas = parseFormulas(sides[1], sides[0].length + 2)
                Pair(leftFormulas, rightFormulas)
            }
            // The input string doesn't contain '|-'. All Formulas will be added to the right side of the state.
            else -> Pair(listOf(), parseFormulas(sides[0], 0))
        }
    }

    private fun parseFormulas(formulaList: String, inputPosition: Int): List<LogicNode> {
        val rawFormulas = formulaList.split(",")
        var position = inputPosition

        return rawFormulas.mapIndexedNotNull { i, formula ->
            try {
                ChangeEquivalences.transform(PropositionalParser().parse(formula, position))
            } catch (e: EmptyFormulaException) {
                if (i != 0 || rawFormulas.size != 1)
                    throw InvalidFormulaFormat("Empty formula at char $position")
                else
                    null
            }
        }
    }
}
