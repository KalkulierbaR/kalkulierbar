import { h } from "preact";
import { NCTabTreeNode } from "../../../types/nc-tableaux";
import { useRef } from "preact/hooks";
import { Tree } from "../../../types/tree";
import Rectangle from "../../rectangle";
import { DragTransform } from "../../../types/ui";
import { classMap } from "../../../util/class-map";

import * as style from "./style.scss";
import Draggable from "../../draggable";

interface Props {
    node: Tree<NCTabTreeNode>;
    /**
     * The id of a node if one is selected
     */
    selected: boolean;
    /**
     * The function to call, when the user selects a node
     */
    selectNodeCallback: (node: NCTabTreeNode) => void;
    /**
     * The drag transform of this node
     */
    dragTransform: DragTransform;
    /**
     * Callback to set this node's drag
     */
    onDrag: (id: number, dt: DragTransform) => void;
    /**
     * Current zoom factor of the SVG (needed for drag computation)
     */
    zoomFactor: number;
}

const NCTabNode: preact.FunctionalComponent<Props> = ({
    node,
    selected,
    selectNodeCallback,
    dragTransform,
    onDrag,
    zoomFactor,
}) => {
    const textRef = useRef<SVGTextElement>();

    // Uses parameter lemmaNodesSelectable to determine if the Node should be selectable
    const nodeIsClickable = true;

    /**
     * Handle the onClick event of the node
     * @returns {void}
     */
    const handleClick = () => {
        if (nodeIsClickable) {
            selectNodeCallback(node.data);
        }
    };

    return (
        <Draggable
            onClick={handleClick}
            class={classMap({
                [style.node]: true,
                [style.nodeClosed]: node.data.isClosed,
                [style.nodeClickable]: nodeIsClickable,
            })}
            elementRef={textRef}
            dragTransform={dragTransform}
            onDrag={onDrag}
            zoomFactor={zoomFactor}
            id={node.data.id}
        >
            <Rectangle
                elementRef={textRef}
                disabled={node.data.isClosed}
                selected={selected}
            />
            <text
                ref={textRef}
                text-anchor="middle"
                class={classMap({
                    [style.textSelected]: selected,
                    [style.textClosed]: node.data.isClosed,
                })}
                x={node.x}
                y={node.y}
            >
                {node.data.spelling}
            </text>
        </Draggable>
    );
};

export default NCTabNode;
