import { Fragment, h } from "preact";

import {
    ModalTableauxNode,
    ModalTableauxTreeLayoutNode,
} from "../../../../types/calculus/modal-tableaux";
import { Tree } from "../../../../types/tree";
import { DragTransform } from "../../../../types/ui";
import SMTabNode from "../node";

import * as style from "./style.scss";

interface Props {
    /**
     * All nodes of the current state
     */
    nodes: ModalTableauxNode[];
    /**
     * The current tree to render
     */
    node: Tree<ModalTableauxTreeLayoutNode>;
    /**
     * The id of a node if one is selected
     */
    selectedNodeId: number | undefined;
    /**
     * The function to call, when the user selects a node
     */
    selectNodeCallback: (node: ModalTableauxTreeLayoutNode) => void;
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
    /**
     * Whether or not tree waits for the user to select a leaf
     */
    leafSelectiion: boolean;
}

const SubTree: preact.FunctionalComponent<Props> = ({
    nodes,
    node,
    dragTransforms,
    selectedNodeId,
    selectNodeCallback,
    onDrag,
    zoomFactor,
    leafSelectiion,
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
                        <SubTree
                            nodes={nodes}
                            node={c}
                            onDrag={onDrag}
                            selectedNodeId={selectedNodeId}
                            selectNodeCallback={selectNodeCallback}
                            dragTransforms={dragTransforms}
                            zoomFactor={zoomFactor}
                            leafSelectiion={leafSelectiion}
                        />
                    </Fragment>
                );
            })}
            <SMTabNode
                nodes={nodes}
                node={node}
                selected={selectedNodeId === node.data.id}
                selectedNodeId={selectedNodeId}
                selectNodeCallback={selectNodeCallback}
                dragTransform={dt}
                onDrag={onDrag}
                zoomFactor={zoomFactor}
                leafSelection={leafSelectiion}
            />
        </g>
    );
};

export default SubTree;
