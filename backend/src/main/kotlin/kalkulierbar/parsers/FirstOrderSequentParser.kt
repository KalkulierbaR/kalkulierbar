package kalkulierbar.parsers

import kalkulierbar.EmptyFormulaException
import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.transform.ChangeEquivalences

object FirstOrderSequentParser {
    /**
     * Parses a string directly into a FOSCState using the FirstOrderParser
     * to parse single formulas separated by ',' in the input string
     * and separated by '|-' to differentiate between left and right side;
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

    private fun parseFormulas(
        formulaList: String,
        inputPosition: Int,
    ): List<LogicNode> {
        val rawFormulas = splitToFormulas(formulaList)

        return rawFormulas.mapIndexedNotNull { i, formula ->
            try {
                ChangeEquivalences.transform(FirstOrderParser().parse(formula, inputPosition))
            } catch (e: EmptyFormulaException) {
                if (i != 0 || rawFormulas.size != 1) {
                    throw InvalidFormulaFormat("Empty formula at char $inputPosition")
                } else {
                    null
                }
            }
        }
    }

    /**
     * Splits a string into Formulas by splitting at ',' which are not bound within a parenthesis.
     */
    private fun splitToFormulas(str: String): List<String> {
        val foundFormulas = mutableListOf<String>()
        val it = str.iterator()

        var openParentheses = 0
        var startOfFormula = 0

        for ((index, value) in it.withIndex()) {
            if (value == '(') {
                openParentheses += 1
            } else if (value == ')') {
                openParentheses -= 1
            } else if (value == ',' && openParentheses == 0) {
                foundFormulas.add(str.subSequence(startOfFormula, index).toString())
                startOfFormula = index + 1
            }
        }
        foundFormulas.add(str.subSequence(startOfFormula, str.length).toString())

        return foundFormulas
    }
}
