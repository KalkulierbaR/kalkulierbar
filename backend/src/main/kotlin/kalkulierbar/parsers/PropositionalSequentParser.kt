package kalkulierbar.parsers

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.EmptyFormulaException
import kalkulierbar.logic.And
import kalkulierbar.logic.Equiv
import kalkulierbar.logic.Impl
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Var
import kalkulierbar.sequentCalculus.psc.PSCState;

@Suppress("TooManyFunctions")
open class PropositionalSequentParser {

    open fun parse(formula: String): PSCState {
        val sides = formula.split("|-") 
        
        if (sides.size > 2) {
            var i = 0;
            i += sides[0].length;
            for (j in 1..(sides.size - 2)) {
                i += sides[j].length;
                i += 2;
            }
            throw InvalidFormulaFormat("Incorrect formula syntax at char $i")
        }
        else if (sides.size == 2) {
            val leftFormulas = mutableListOf<LogicNode>();
            val rightFormulas = mutableListOf<LogicNode>();

            val leftArray = sides[0].split(",");
            val rightArray = sides[1].split(",");

            var currentIndex = 0;
            for (strIndex in leftArray.indices) {
                try {
                    leftFormulas.add(PropositionalParser().parse(leftArray[strIndex], currentIndex))
                } catch(e: EmptyFormulaException) {
                    if (strIndex != 0 || leftArray.size != 1) {
                        throw InvalidFormulaFormat("Empty formula at char $currentIndex")
                    }
                }
                currentIndex += leftArray[strIndex].length;
                if (strIndex < leftArray.size - 1) {
                    currentIndex++;
                }
            }
            currentIndex += 2;
            for (strIndex in rightArray.indices) {
                try {
                    rightFormulas.add(PropositionalParser().parse(rightArray[strIndex], currentIndex))
                } catch(e: EmptyFormulaException) {
                    if (strIndex != 0 || rightArray.size != 1) {
                        throw InvalidFormulaFormat("Empty formula at char $currentIndex")
                    }
                }
                currentIndex += rightArray[strIndex].length;
                if (strIndex < rightArray.size - 1) {
                    currentIndex++;
                }
            }

            return PSCState(leftFormulas, rightFormulas);
        }
        else {
            val leftFormulas = mutableListOf<LogicNode>();
            val rightFormulas = mutableListOf<LogicNode>();

            val rightArray = sides[0].split(",");

            var currentIndex = 0;
            for (strIndex in rightArray.indices) {
                try {
                    rightFormulas.add(PropositionalParser().parse(rightArray[strIndex], currentIndex))
                } catch(e: EmptyFormulaException) {
                    if (strIndex != 0 || rightArray.size != 1) {
                        throw InvalidFormulaFormat("Empty formula at char $currentIndex")
                    }
                }
                currentIndex += rightArray[strIndex].length;
                if (strIndex < rightArray.size - 1) {
                    currentIndex++;
                }
            }
            
            return PSCState(leftFormulas, rightFormulas);
        }
    }
}
