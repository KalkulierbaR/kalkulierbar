import { Fragment, h } from "preact";
import { NCTabTreeNode } from "../../../../types/calculus/nc-tableaux";
import { Tree } from "../../../../types/tree";
import { DragTransform } from "../../../../types/ui";
import NCTabNode from "../node";

import * as style from "./style.scss";

interface Props {
    /**
     * The current tree to render
     */
    node: Tree<NCTabTreeNode>;
    /**
     * The id of a node if one is selected
     */
    selectedNodeId: number | undefined;
    /**
     * The function to call, when the user selects a node
     */
    selectNodeCallback: (node: NCTabTreeNode) => void;
    /**
     * Callback to change specific drag
     */
    onDrag: (id: number, dt: DragTransform) => void;
    /**
     * All drag transforms
     */
    dragTransforms: Record<number, DragTransform>;
    /**
     * Zoom factor of the SVG
     */
    zoomFactor: number;
}

const NCSubTree: preact.FunctionalComponent<Props> = ({
    node,
    dragTransforms,
    selectedNodeId,
    selectNodeCallback,
    onDrag,
    zoomFactor,
}) => {
    const dt = dragTransforms[node.data.id] ?? { x: 0, y: 0 };

    return (
        <g transform={`translate(${dt.x} ${dt.y})`}>
            {node.children.map((c, i) => {
                const childDt = dragTransforms[c.data.id] ?? { x: 0, y: 0 };
                return (
                    <Fragment key={i}>
                        <line
                            class={style.link}
                            x1={node.x}
                            y1={node.y + 6}
                            x2={c.x + childDt.x}
                            y2={c.y + childDt.y - 16}
                        />
                        <NCSubTree
                            node={c}
                            onDrag={onDrag}
                            selectedNodeId={selectedNodeId}
                            selectNodeCallback={selectNodeCallback}
                            dragTransforms={dragTransforms}
                            zoomFactor={zoomFactor}
                        />
                    </Fragment>
                );
            })}
            <NCTabNode
                node={node}
                selected={selectedNodeId === node.data.id}
                selectNodeCallback={selectNodeCallback}
                dragTransform={dt}
                onDrag={onDrag}
                zoomFactor={zoomFactor}
            />
        </g>
    );
};

export default NCSubTree;
