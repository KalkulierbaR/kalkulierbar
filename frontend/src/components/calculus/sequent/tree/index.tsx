import {h} from "preact";

import {FormulaTreeLayoutNode, SequentNode,} from "../../../../types/calculus/sequent";
import {findSubTree} from "../../../../util/layout/tree";
import {sequentTreeLayout} from "../../../../util/sequent";
import Zoomable from "../../../svg/zoomable";

import * as style from "./style.scss";
import {SubTree} from "./subtree";

interface Props {
    // Nodes of the tree
    nodes: SequentNode[];
    // The id of the selected Node
    selectedNodeId: number | undefined;
    // informs the element if the screen is small
    smallScreen: boolean;
    // The id of the selected Rule
    selectedRuleName: string;
    // The funktion to call, when user selects a Formula
    selectFormulaCallback: (
        formula: FormulaTreeLayoutNode,
        nodeId: number,
    ) => void;
    // The selected index of a formula
    selectedListIndex?: string;
}

const SequentTreeView: preact.FunctionalComponent<Props> = ({
    nodes,
    selectedNodeId,
    selectedRuleName,
    selectFormulaCallback,
    selectedListIndex,
}) => {
    const { root, height, width: treeWidth } = sequentTreeLayout(nodes);

    const treeHeight = Math.max(height, 200);

    /**
     * Go to a node in the tree
     * @returns {[number, number]} - The target coordinates
     */
    const transformGoTo = (): [number, number] => {
        const node = findSubTree(
            root,
            (t) => t.data.id === selectedNodeId,
            (t) => t,
        )!;

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

export default SequentTreeView;
