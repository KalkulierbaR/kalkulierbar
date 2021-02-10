import { h } from "preact";

import {
    FormulaTreeLayoutNode,
    PSCTreeLayoutNode,
} from "../../../../types/calculus/psc";
import { PSCNode } from "../../../../types/calculus/psc";
import { findSubTree } from "../../../../util/layout/tree";
import { pscTreeLayout } from "../../../../util/psc";
import Zoomable from "../../../svg/zoomable";
import { SubTree } from "../tree/subtree";

import * as style from "./style.scss";

interface Props {
    // Nodes of the tree
    nodes: PSCNode[];
    // The id of the selected Node
    selectedNodeId: number | undefined;
    // The function to call, when user selects a node
    selectNodeCallback: (
        node: PSCTreeLayoutNode,
        selectValue?: boolean,
    ) => void;
    // informs the element if the screen is small
    smallScreen: boolean;
    // The id of the selected Rule
    selectedRuleName: string;
    // The funktion to call, when user selects a Formula
    selectFormulaCallback: (formula: FormulaTreeLayoutNode) => void;
    // The selected index of a formula
    selectedListIndex?: string;
}

const PSCTreeView: preact.FunctionalComponent<Props> = ({
    nodes,
    selectNodeCallback,
    selectedNodeId,
    selectedRuleName,
    selectFormulaCallback,
    selectedListIndex,
}) => {
    const { root, height, width: treeWidth } = pscTreeLayout(nodes);

    const treeHeight = Math.max(height, 200);

    const transformGoTo = (): [number, number] => {
        const node = findSubTree(
            root,
            (t) => t.data.id === selectedNodeId,
            (t) => t,
        )!;
        selectNodeCallback(node.data, undefined);

        const { x, y } = node;
        return [treeWidth / 2 - x, treeHeight / 2 - y];
    };

    return (
        <div class="card">
            <Zoomable
                class={style.svg}
                width="100%"
                height="calc(100vh - 192px)"
                style="min-height: 60vh"
                viewBox={`0 -16 ${treeWidth} ${treeHeight}`}
                preserveAspectRatio="xMidYMid meet"
                transformGoTo={transformGoTo}
            >
                {(transform) => (
                    <g
                        transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
                    >
                        <g>
                            {
                                // render nodes -> Recursively render each sub tree
                                <SubTree
                                    node={root}
                                    selectedNodeId={selectedNodeId}
                                    selectNodeCallback={selectNodeCallback}
                                    zoomFactor={transform.k}
                                    ruleName={selectedRuleName}
                                    selectFormulaCallback={
                                        selectFormulaCallback
                                    }
                                    selectedListIndex={selectedListIndex}
                                />
                            }
                        </g>
                    </g>
                )}
            </Zoomable>
        </div>
    );
};

export default PSCTreeView;
