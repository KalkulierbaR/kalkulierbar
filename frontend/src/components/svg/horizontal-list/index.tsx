import preact, { Fragment } from "preact";

import {
    FormulaTreeLayoutNode,
    SequentTreeLayoutNode,
    Turnstyle,
} from "../../../types/calculus/sequent";
import { LayoutItem } from "../../../types/layout";
import { classMap } from "../../../util/class-map";
import FormulaTreeNode from "../../calculus/sequent/formula-node";

import * as style from "./style.module.scss";

interface Props {
    /**
     * The Formulars to put in the left side
     */
    antecedent: Array<FormulaTreeLayoutNode>;
    /**
     * The Formulars to put in the right side
     */
    succedent: Array<FormulaTreeLayoutNode>;
    turnstyle: Turnstyle;
    /**
     * The Node the list will be inside
     */
    node: LayoutItem<SequentTreeLayoutNode>;
    /**
     * Boolean to change the style of the node if it is selected
     */
    selected: boolean;
    /**
     * The Callback if the Formula got selected
     */
    selectFormulaCallback: (
        formula: FormulaTreeLayoutNode,
        nodeId: number,
    ) => void;
    /**
     * Index of the selected Formula
     */
    selectedListIndex?: string;
}

interface CommaProps {
    /**
     * the x coordinate on which the comma is drawn
     */
    x: number;
    /**
     * the y coordinate on which the comma is drawn
     */
    y: number;
    /**
     * whether or not the current node is closed
     */
    isClosed: boolean;
}

const Comma: preact.FunctionalComponent<CommaProps> = ({ x, y, isClosed }) => {
    return (
        <text
            class={classMap({
                [style.text]: true,
                [style.textClosed]: isClosed,
            })}
            text-anchor="left"
            x={x}
            y={y}
        >
            ,
        </text>
    );
};

interface FormulaProps {
    /**
     * the FormulaNode which will be drawn by the method
     */
    formula: FormulaTreeLayoutNode;
    /**
     * the big node in which the formula is drawn
     */
    node: LayoutItem<SequentTreeLayoutNode>;
    /**
     * string in the pattern of (r, l)[0-9]* indicating the side of the formula and its index
     */
    selectedListIndex: string | undefined;
    /**
     * Callback for selecting a formula
     */
    selectFormulaCallback: (
        formula: FormulaTreeLayoutNode,
        nodeId: number,
    ) => void;
    /**
     * the parameter which tells if the current node is selected or not
     */
    selected: boolean;
}

const Formula: preact.FunctionalComponent<FormulaProps> = ({
    formula,
    node,
    selectedListIndex,
    selectFormulaCallback,
    selected,
}) => {
    return (
        <FormulaTreeNode
            formula={formula}
            node={node}
            xCoord={formula.x + node.x - node.data.width / 2}
            selectedListIndex={selectedListIndex}
            selectFormulaCallback={selectFormulaCallback}
            selected={selected}
        />
    );
};

interface SeperatorProps {
    /**
     * the x coordinate on which the seperator is drawn
     */
    x: number;
    /**
     * the y coordinate on which the seperator is drawn
     */
    y: number;
    /**
     * whether or not the current node is closed
     */
    isClosed: boolean;
}

const Seperator: preact.FunctionalComponent<SeperatorProps> = ({
    x,
    y,
    isClosed,
}) => {
    return (
        <text
            class={classMap({
                [style.text]: true,
                [style.textClosed]: isClosed,
            })}
            text-anchor="middle"
            x={x}
            y={y}
        >
            ⊢
        </text>
    );
};

interface SemiSeqentProps {
    prefix: string;
    formulas: Array<FormulaTreeLayoutNode>;
    /**
     * the overlaying node in which the sequence is to be drawn
     */
    node: LayoutItem<SequentTreeLayoutNode>;
    /**
     * index of formula
     */
    selectedListIndex?: string;
    /**
     * Callback for selecting a formula
     * @param n the selected node
     * @returns
     */
    selectFormulaCallback: (
        formula: FormulaTreeLayoutNode,
        nodeId: number,
    ) => void;
    /**
     * Whether or not the current node is selected
     */
    selected: boolean;
}

const SemiSequent: preact.FunctionalComponent<SemiSeqentProps> = ({
    prefix,
    formulas,
    node,
    selectedListIndex,
    selectFormulaCallback,
    selected,
}) => {
    return (
        <Fragment>
            {formulas.map((f, i) => (
                <Fragment key={`${prefix}${i}`}>
                    <Formula
                        formula={f}
                        node={node}
                        selectedListIndex={selectedListIndex}
                        selectFormulaCallback={selectFormulaCallback}
                        selected={selected}
                    />
                    {i == formulas.length - 1 ? null : Comma}
                </Fragment>
            ))}
        </Fragment>
    );
};

interface SequentProps {
    /**
     * the formulas on the left hand side of the sequencenodeName(
     */
    antecedent: Array<FormulaTreeLayoutNode>;
    /**
     * the formulas on the right hand side of the sequence
     */
    succedent: Array<FormulaTreeLayoutNode>;
    turnstyle: Turnstyle;
    /**
     * the overlaying node in which the sequence is to be drawn
     */
    node: LayoutItem<SequentTreeLayoutNode>;
    /**
     * index of formula
     */
    selectedListIndex?: string;
    /**
     * Callback for selecting a formula
     * @param n the selected node
     * @returns
     */
    selectFormulaCallback: (
        formula: FormulaTreeLayoutNode,
        nodeId: number,
    ) => void;
    /**
     * Whether or not the current node is selected
     */
    selected: boolean;
}

const Sequent: preact.FunctionalComponent<SequentProps> = ({
    antecedent,
    succedent,
    node,
    selectedListIndex,
    turnstyle,
    selectFormulaCallback,
    selected,
}) => {
    return (
        <Fragment>
            <SemiSequent
                prefix="l"
                formulas={antecedent}
                node={node}
                selectedListIndex={selectedListIndex}
                selectFormulaCallback={selectFormulaCallback}
                selected={selected}
            />
            <Seperator
                x={turnstyle.x + node.x - node.data.width / 2}
                y={node.y}
                isClosed={node.data.isClosed}
            />
            <SemiSequent
                prefix="r"
                formulas={succedent}
                node={node}
                selectedListIndex={selectedListIndex}
                selectFormulaCallback={selectFormulaCallback}
                selected={selected}
            />
        </Fragment>
    );
};

const HorizontalList: preact.FunctionalComponent<Props> = ({
    antecedent,
    succedent,
    turnstyle,
    node,
    selected,
    selectFormulaCallback,
    selectedListIndex,
}) => {
    return (
        <g>
            <Sequent
                antecedent={antecedent}
                succedent={succedent}
                turnstyle={turnstyle}
                node={node}
                selectedListIndex={selectedListIndex}
                selectFormulaCallback={selectFormulaCallback}
                selected={selected}
            />
        </g>
    );
};

export default HorizontalList;
