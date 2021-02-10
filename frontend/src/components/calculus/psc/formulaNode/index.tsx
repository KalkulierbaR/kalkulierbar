import { h } from "preact";
import { useRef } from "preact/hooks";

import {
    FormulaTreeLayoutNode,
    PSCTreeLayoutNode,
} from "../../../../types/calculus/psc";
import { LayoutItem } from "../../../../types/layout";
import { parseFormula } from "../../../../util/psc";
import SmallRec from "../../../svg/SmallRec";

import * as style from "./style.scss";

interface Props {
    node: LayoutItem<PSCTreeLayoutNode>;
    formula: FormulaTreeLayoutNode;
    xCord: number;
    selectedListIndex?: string;
    selectFormulaCallback: (formula: FormulaTreeLayoutNode) => void;
    selectNodeCallback: (
        node: PSCTreeLayoutNode,
        selectedValue?: boolean,
    ) => void;
    selected: boolean;
}

const FormulaTreeNode: preact.FunctionalComponent<Props> = ({
    node,
    formula,
    xCord,
    selectedListIndex,
    selectFormulaCallback,
    selectNodeCallback,
    selected,
}) => {
    const textRef = useRef<SVGTextElement>();

    const nodeIsClickable = !node.data.isClosed;

    const handleClick = () => {
        if (nodeIsClickable) {
            selectNodeCallback(node.data, true);
            selectFormulaCallback(formula);
        }
    };

    return (
        <g onClick={handleClick}>
            <SmallRec
                elementRef={textRef}
                disabled={node.data.isClosed}
                selected={selectedListIndex === formula.id && selected}
            />
            <text
                ref={textRef}
                text-anchor="middle"
                class={style.textSelected}
                x={xCord}
                y={node.y}
            >
                {parseFormula(formula)}
            </text>
        </g>
    );
};

export default FormulaTreeNode;
