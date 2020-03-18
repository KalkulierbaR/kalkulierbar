import { h } from "preact";
import { NCTableauxNode, NCTabTreeNode } from "../../../types/nc-tableaux";
import { ncTabTreeLayout } from "../../../util/nc-tableaux";
import Zoomable from "../../zoomable";
import NCSubTree from "./subtree";
import { DragTransform } from "../../../types/ui";

interface Props {
    nodes: NCTableauxNode[];
    /**
     * The id of a node if one is selected
     */
    selectedNodeId: number | undefined;
    /**
     * The function to call, when the user selects a node
     */
    selectNodeCallback: (node: NCTabTreeNode) => void;
    /**
     * Drag transforms of all nodes
     */
    dragTransforms: Record<number, DragTransform>;
    /**
     * Callback to change a specific drag
     */
    onDrag: (id: number, dt: DragTransform) => void;
}

const NCTabTree: preact.FunctionalComponent<Props> = ({
    nodes,
    dragTransforms,
    onDrag,
    selectedNodeId,
    selectNodeCallback,
}) => {
    const { root, width, height } = ncTabTreeLayout(nodes);
    return (
        <Zoomable
            width="100%"
            height="calc(100vh - 192px)"
            style="min-height: 60vh"
            viewBox={`0 -16 ${width} ${height}`}
            preserveAspectRatio="xMidyMid meet"
        >
            {(transform) => (
                <g
                    transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
                >
                    <NCSubTree
                        node={root}
                        zoomFactor={transform.k}
                        selectedNodeId={selectedNodeId}
                        selectNodeCallback={selectNodeCallback}
                        dragTransforms={dragTransforms}
                        onDrag={onDrag}
                    />
                </g>
            )}
        </Zoomable>
    );
};

export default NCTabTree;
