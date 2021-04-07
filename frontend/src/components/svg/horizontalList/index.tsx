import preact, { h, RefObject } from "preact";
import { useEffect, useState } from "preact/hooks";

import {
    FormulaNode,
    FormulaTreeLayoutNode,
} from "../../../types/calculus/sequent";
import { SequentTreeLayoutNode } from "../../../types/calculus/sequent";
import { LayoutItem } from "../../../types/layout";
import { classMap } from "../../../util/class-map";
import { parseFormula } from "../../../util/sequent";
import { estimateSVGTextWidth } from "../../../util/text-width";
import FormulaTreeNode from "../../calculus/sequent/formulaNode";

import * as style from "./style.scss";

interface Props {
    textRef: RefObject<SVGTextElement>;
    /**
     * The Formulars to put in the left side
     */
    leftFormulas: FormulaNode[];
    /**
     * The Formulars to put in the right side
     */
    rightFormulas: FormulaNode[];
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

const NODE_SPACING = 4;
const SEPERATOR_SPACING = 12;
const RECTANGLE_PUFFER = 4;
const NODE_PUFFER = 16;

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
     * the x coordinate in which the Formula is drawn
     */
    xCoord: number;
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
    xCoord,
    selectFormulaCallback,
    selected,
}) => {
    return (
        <FormulaTreeNode
            formula={formula}
            node={node}
            xCoord={
                xCoord +
                (estimateSVGTextWidth(parseFormula(formula)) +
                    RECTANGLE_PUFFER) /
                    2
            }
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
            text-anchor="left"
            x={x}
            y={y}
        >
            ⊢
        </text>
    );
};

/**
 * Creates an array which contains the htmlCode for the given Sequence. (formulas, commas and the sequenceSeperator)
 * @param {FormulaNode[]}leftFormulas the formulas on the left hand side of the sequence
 * @param {FormulaNode[]}rightFormulas the formulas on the right hand side of the sequence
 * @param {LayoutItem<SequentTreeLayoutNode>}node the overlaying node in which the sequence is to be drawn
 * @param {string | undefined} selectedListIndex index of formula
 * @param {number} dimsX dimension x
 * @param {Function<FormulaTreeLayoutNode>} selectFormulaCallback Callback for selecting a formula
 * @param {boolean}selected Whether or not the current node is selected
 * @returns {any} HTML
 */
// FIXME: Turn into preact component?
const getSequence = (
    leftFormulas: FormulaNode[],
    rightFormulas: FormulaNode[],
    node: LayoutItem<SequentTreeLayoutNode>,
    selectedListIndex: string | undefined,
    dimsX: number,
    selectFormulaCallback: (
        formula: FormulaTreeLayoutNode,
        nodeId: number,
    ) => void,
    selected: boolean,
) => {
    let totalSize = 0;
    leftFormulas.forEach((elem, index) => {
        totalSize += estimateSVGTextWidth(
            parseFormula(elem) + RECTANGLE_PUFFER,
        );
        if (index < leftFormulas.length - 1) {
            totalSize += NODE_SPACING;
        }
    });

    totalSize += SEPERATOR_SPACING;

    rightFormulas.forEach((elem, index) => {
        totalSize += estimateSVGTextWidth(
            parseFormula(elem) + RECTANGLE_PUFFER,
        );
        if (index < rightFormulas.length - 1) {
            totalSize += NODE_SPACING;
        }
    });

    totalSize = dimsX + NODE_PUFFER / 2;

    const nodeArray: h.JSX.Element[] = [];
    leftFormulas.forEach((elem, index) => {
        const formulaLayoutNode: FormulaTreeLayoutNode = {
            ...elem,
            id: `l${index}`,
        };
        nodeArray.push(
            <Formula
                formula={formulaLayoutNode}
                node={node}
                selectedListIndex={selectedListIndex}
                xCoord={totalSize}
                selectFormulaCallback={selectFormulaCallback}
                selected={selected}
            />,
        );
        totalSize +=
            estimateSVGTextWidth(parseFormula(elem)) + RECTANGLE_PUFFER;
        if (index === leftFormulas.length - 1) return;

        nodeArray.push(
            <Comma x={totalSize} y={node.y} isClosed={node.data.isClosed} />,
        );
        totalSize += NODE_SPACING;
    });

    nodeArray.push(
        <Seperator x={totalSize} y={node.y} isClosed={node.data.isClosed} />,
    );
    totalSize += SEPERATOR_SPACING;

    rightFormulas.forEach((elem, index) => {
        const formulaLayoutNode: FormulaTreeLayoutNode = {
            ...elem,
            id: `r${index}`,
        };
        nodeArray.push(
            <Formula
                formula={formulaLayoutNode}
                node={node}
                selectedListIndex={selectedListIndex}
                xCoord={totalSize}
                selectFormulaCallback={selectFormulaCallback}
                selected={selected}
            />,
        );
        totalSize +=
            estimateSVGTextWidth(parseFormula(elem)) + RECTANGLE_PUFFER;
        if (index === rightFormulas.length - 1) return;

        nodeArray.push(
            <Comma x={totalSize} y={node.y} isClosed={node.data.isClosed} />,
        );
        totalSize += NODE_SPACING;
    });

    return nodeArray;
};

const horizontalList: preact.FunctionalComponent<Props> = ({
    textRef,
    leftFormulas,
    rightFormulas,
    node,
    selected,
    selectFormulaCallback,
    selectedListIndex,
}) => {
    const [dims, setDims] = useState({ x: 0, y: 0, height: 0, width: 0 });

    // Gets the bounding box of the text inside the horizontal list
    useEffect(() => {
        if (!textRef.current) {
            return;
        }

        const box = textRef.current.getBBox();
        box.width += 16;
        box.x -= 8;
        box.height += 8;
        box.y -= 4;
        setDims(box);
    });

    // FIXME: Why this identity mapping?
    return (
        <g>
            {getSequence(
                leftFormulas,
                rightFormulas,
                node,
                selectedListIndex,
                dims.x,
                selectFormulaCallback,
                selected,
            ).map((el) => el)}
        </g>
    );
};

export default horizontalList;
