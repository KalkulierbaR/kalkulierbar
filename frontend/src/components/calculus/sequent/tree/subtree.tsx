import { Fragment } from "preact";

import {
    FormulaTreeLayoutNode,
    SequentTreeLayoutNode,
} from "../../../../types/calculus/sequent";
import { Tree } from "../../../../types/tree";
import SequentTreeNode from "../node";

import * as style from "./style.module.scss";

interface LineUnderNodeProps {
    /**
     * the node which the line is drawn under
     */
    node: Tree<SequentTreeLayoutNode>;
}

const LineUnderNode: preact.FunctionalComponent<LineUnderNodeProps> = ({
    node,
}) => {
    if (node.children.length === 0) return null;

    const firstChild = node.children[0];
    let lastMove: string;
    switch (firstChild.data.lastMove?.type) {
        case "notRight":
            lastMove = "¬R";
            break;
        case "notLeft":
            lastMove = "¬L";
            break;
        case "andRight":
            lastMove = "∧R";
            break;
        case "andLeft":
            lastMove = "∧L";
            break;
        case "orRight":
            lastMove = "∨R";
            break;
        case "orLeft":
            lastMove = "∨L";
            break;
        case "impLeft":
            lastMove = "→L";
            break;
        case "impRight":
            lastMove = "→R";
            break;
        case "Ax":
            lastMove = "Ax";
            break;
        case "exLeft":
            lastMove = "∃L";
            break;
        case "exRight":
            lastMove = "∃R";
            break;
        case "allLeft":
            lastMove = "∀L";
            break;
        case "allRight":
            lastMove = "∀R";
            break;
        default:
            lastMove = "";
    }

    const halfNodeWidth = node.data.width / 2;
    const lastChild = node.children[node.children.length - 1];

    const x1 =
        Math.min(node.x - halfNodeWidth, firstChild.x - firstChild.width / 2) +
        16;
    const x2 =
        Math.max(
            node.x + halfNodeWidth,
            lastChild.x + lastChild.data.width / 2,
        ) - 4;
    const y = node.y - 25;

    return (
        <g>
            <line class={style.link} x1={x1} y1={y} x2={x2} y2={y} />
            <text
                class={style.lineText}
                text-anchor="middle"
                x={x2 + 15}
                y={y + 4}
            >
                {lastMove}
            </text>
        </g>
    );
};

interface Props {
    node: Tree<SequentTreeLayoutNode>;
    selectedNodeId?: number;
    selectedListIndex?: string;
    selectFormulaCallback: (f: FormulaTreeLayoutNode, nodeId: number) => void;
    zoomFactor: number;
    ruleName: string;
}

export const SubTree: preact.FunctionalComponent<Props> = ({
    node,
    selectFormulaCallback,
    selectedNodeId,
    selectedListIndex,
    zoomFactor,
    ruleName,
}) => {
    const dt = { x: 0, y: 0 };
    return (
        <g transform={`translate(${dt.x} ${dt.y})`}>
            {node.children.map((c, i) => {
                return (
                    <Fragment key={i}>
                        <SubTree
                            node={c}
                            selectedNodeId={selectedNodeId}
                            zoomFactor={zoomFactor}
                            ruleName={ruleName}
                            selectFormulaCallback={selectFormulaCallback}
                            selectedListIndex={selectedListIndex}
                        />
                    </Fragment>
                );
            })}
            <SequentTreeNode
                node={node}
                selected={node.data.id === selectedNodeId}
                selectFormulaCallback={selectFormulaCallback}
                selectedListIndex={selectedListIndex}
            />
            <g
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <LineUnderNode node={node} />
            </g>
        </g>
    );
};
