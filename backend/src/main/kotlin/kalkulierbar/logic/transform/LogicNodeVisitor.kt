package kalkulierbar.logic.transform

import kalkulierbar.FormulaConversionException
import kalkulierbar.logic.And
import kalkulierbar.logic.Equiv
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.Impl
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier
import kalkulierbar.logic.Var

/**
 * Skeleton Class for LogicNode visitor implementations
 */
abstract class LogicNodeVisitor<ReturnType> {
    open fun visit(node: LogicNode): ReturnType {
        throw FormulaConversionException("Visiting LogicNode not implemented")
    }

    open fun visit(node: And): ReturnType {
        throw FormulaConversionException("Visiting And not implemented")
    }

    open fun visit(node: Equiv): ReturnType {
        throw FormulaConversionException("Visiting Equiv not implemented")
    }

    open fun visit(node: Impl): ReturnType {
        throw FormulaConversionException("Visiting Impl not implemented")
    }

    open fun visit(node: Not): ReturnType {
        throw FormulaConversionException("Visiting Not not implemented")
    }

    open fun visit(node: Or): ReturnType {
        throw FormulaConversionException("Visiting Or not implemented")
    }

    open fun visit(node: Var): ReturnType {
        throw FormulaConversionException("Visiting Var not implemented")
    }

    open fun visit(node: Relation): ReturnType {
        throw FormulaConversionException("Visiting Relation not implemented")
    }

    open fun visit(node: UniversalQuantifier): ReturnType {
        throw FormulaConversionException("Visiting UniversalQuantifier not implemented")
    }

    open fun visit(node: ExistentialQuantifier): ReturnType {
        throw FormulaConversionException("Visiting ExistentialQuantifier not implemented")
    }
}
