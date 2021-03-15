import { h } from "preact";
import { useRef } from "preact/hooks";

import {
    FormulaTreeLayoutNode,
    SequentTreeLayoutNode,
} from "../../../../types/calculus/sequent";
import { LayoutItem } from "../../../../types/layout";
import { classMap } from "../../../../util/class-map";
import { parseFormula } from "../../../../util/sequent";
import SmallRec from "../../../svg/SmallRec";

import * as style from "./style.scss";

interface Props {
    node: LayoutItem<SequentTreeLayoutNode>;
    formula: FormulaTreeLayoutNode;
    xCord: number;
    selectedListIndex?: string;
    selectFormulaCallback?: (
        formula: FormulaTreeLayoutNode,
        nodeId: number,
    ) => void;
    selected: boolean;
}

const FormulaTreeNode: preact.FunctionalComponent<Props> = ({
    node,
    formula,
    xCord,
    selectedListIndex,
    selectFormulaCallback,
    selected,
}) => {
    const textRef = useRef<SVGTextElement>();

    const nodeIsClickable = !node.data.isClosed;

    const handleClick = () => {
        if (nodeIsClickable) {
            selectFormulaCallback!(formula, node.data.id);
        }
    };

    return (
        <g onClick={handleClick}>
            <SmallRec
                elementRef={textRef}
                disabled={node.data.isClosed}
                selected={selectedListIndex === formula.id && selected}
                class={classMap({
                    [style.nodeClickable]: nodeIsClickable,
                })}
            />
            <text
                ref={textRef}
                text-anchor="middle"
                class={classMap({
                    [style.node]: true,
                    [style.nodeClickable]: nodeIsClickable,
                    [style.textSelected]:
                        selectedListIndex === formula.id && selected,
                    [style.textClosed]: !nodeIsClickable,
                })}
                x={xCord}
                y={node.y}
            >
                {parseFormula(formula)}
            </text>
        </g>
    );
};

export default FormulaTreeNode;
