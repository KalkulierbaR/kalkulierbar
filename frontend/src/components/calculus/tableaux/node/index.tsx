import { useRef } from "preact/hooks";

import { TableauxTreeLayoutNode } from "../../../../types/calculus/tableaux";
import { LayoutItem } from "../../../../types/layout";
import { DragTransform } from "../../../../types/ui";
import { classMap } from "../../../../util/class-map";
import { nodeName } from "../../../../util/tableaux";
import Draggable from "../../../svg/draggable";
import Rectangle from "../../../svg/rectangle";

import * as style from "./style.module.scss";

interface Props {
    /**
     * The single tree node to represent
     */
    node: LayoutItem<TableauxTreeLayoutNode>;
    /**
     * Boolean to change the style of the node if it is selected
     */
    selected: boolean;
    /**
     * The function to call, when the user selects this node
     */
    selectNodeCallback: (node: TableauxTreeLayoutNode) => void;
    /**
     * Contains the Information, that potential Lemma nodes are selectable
     */
    lemmaNodesSelectable: boolean;
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

// Component representing a single Node of a TableauxTree
const TableauxTreeNode: preact.FunctionalComponent<Props> = ({
    node,
    selected,
    selectNodeCallback,
    lemmaNodesSelectable,
    onDrag,
    dragTransform,
    zoomFactor,
}) => {
    const textRef = useRef<SVGTextElement>(null);

    // Uses parameter lemmaNodesSelectable to determine if the Node should be selectable
    const nodeIsClickable =
        (lemmaNodesSelectable && node.data.isClosed) ||
        (!lemmaNodesSelectable && !node.data.isClosed) ||
        (lemmaNodesSelectable && selected);

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
                [style.nodeClosed]: node.data.isClosed && !lemmaNodesSelectable,
                [style.nodeClickable]: nodeIsClickable,
            })}
            id={node.data.id}
            zoomFactor={zoomFactor}
            dragTransform={dragTransform}
            onDrag={onDrag}
            elementRef={textRef}
        >
            <Rectangle
                elementRef={textRef}
                disabled={node.data.isClosed && !lemmaNodesSelectable}
                selected={selected}
                class={classMap({
                    [style.nodeLemma]: node.data.lemmaSource != null,
                    [style.nodeSelectLemma]:
                        node.data.isClosed && lemmaNodesSelectable,
                })}
            />
            <text
                ref={textRef}
                text-anchor="middle"
                class={classMap({
                    [style.textSelected]: selected,
                    [style.textClosed]:
                        node.data.isClosed && !lemmaNodesSelectable,
                })}
                x={node.x}
                y={node.y}
            >
                {nodeName(node.data)}
            </text>
        </Draggable>
    );
};

export default TableauxTreeNode;
