package kalkulierbar.parsers

import kalkulierbar.EmptyFormulaException
import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.LogicNode
import kalkulierbar.sequentCalculus.psc.PSCState

@Suppress("TooManyFunctions")
open class PropositionalSequentParser {

    /**
     * Parses a string directly into a PSCState using the PropositionalParser
     * to parse single formulas seperated by ',' in the input string
     * and seperated by '|-' to differentiate between left and right side;
     */
    @Suppress("ComplexMethod", "LongMethod", "ThrowsCount")
    open fun parse(formula: String): PSCState {
        // Find left and right formulas in the input string
        val sides = formula.split("|-")

        // If there is more than one '|-' in the input sting throw an error
        if (sides.size > 2) {
            var i = 0
            i += sides[0].length
            for (j in 1..(sides.size - 2)) {
                i += sides[j].length
                i += 2
            }
            throw InvalidFormulaFormat("Incorrect formula syntax at char $i")
        }
        // The Input String consists of exactly one '|-'
        else if (sides.size == 2) {
            val leftFormulas = mutableListOf<LogicNode>()
            val rightFormulas = mutableListOf<LogicNode>()

            val leftArray = sides[0].split(",")
            val rightArray = sides[1].split(",")

            var currentIndex = 0
            for (strIndex in leftArray.indices) {
                try {
                    leftFormulas.add(PropositionalParser().parse(leftArray[strIndex], currentIndex))
                } catch (e: EmptyFormulaException) {
                    if (strIndex != 0 || leftArray.size != 1) {
                        throw InvalidFormulaFormat("Empty formula at char $currentIndex")
                    }
                }
                currentIndex += leftArray[strIndex].length
                if (strIndex < leftArray.size - 1) {
                    currentIndex++
                }
            }
            currentIndex += 2
            for (strIndex in rightArray.indices) {
                try {
                    rightFormulas.add(PropositionalParser().parse(rightArray[strIndex], currentIndex))
                } catch (e: EmptyFormulaException) {
                    if (strIndex != 0 || rightArray.size != 1) {
                        throw InvalidFormulaFormat("Empty formula at char $currentIndex")
                    }
                }
                currentIndex += rightArray[strIndex].length
                if (strIndex < rightArray.size - 1) {
                    currentIndex++
                }
            }

            return PSCState(leftFormulas, rightFormulas)
        }
        // The input string doesn't contain '|-'. All Formulas will be added to the right side of the state.
        else {
            val leftFormulas = mutableListOf<LogicNode>()
            val rightFormulas = mutableListOf<LogicNode>()

            val rightArray = sides[0].split(",")

            var currentIndex = 0
            for (strIndex in rightArray.indices) {
                try {
                    rightFormulas.add(PropositionalParser().parse(rightArray[strIndex], currentIndex))
                } catch (e: EmptyFormulaException) {
                    if (strIndex != 0 || rightArray.size != 1) {
                        throw InvalidFormulaFormat("Empty formula at char $currentIndex")
                    }
                }
                currentIndex += rightArray[strIndex].length
                if (strIndex < rightArray.size - 1) {
                    currentIndex++
                }
            }

            return PSCState(leftFormulas, rightFormulas)
        }
    }
}
