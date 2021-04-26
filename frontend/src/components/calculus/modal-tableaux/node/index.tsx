import {h} from "preact";
import {useRef} from "preact/hooks";

import {ModalTableauxNode, ModalTableauxTreeLayoutNode,} from "../../../../types/calculus/modal-tableaux";
import {Tree} from "../../../../types/tree";
import {DragTransform} from "../../../../types/ui";
import {classMap} from "../../../../util/class-map";
import {isChildOf, nodeName} from "../../../../util/modal-tableaux";
import Draggable from "../../../svg/draggable";
import Rectangle from "../../../svg/rectangle";

import * as style from "./style.scss";

interface Props {
    /**
     * The tree node
     */
    node: Tree<ModalTableauxTreeLayoutNode>;
    /**
     * All Nodes of the current state
     */
    nodes: ModalTableauxNode[];
    /**
     * The id of a node if one is selected
     */
    selected: boolean;
    /**
     * The Id of the currently selected Node
     */
    selectedNodeId: number | undefined;
    /**
     * The function to call, when the user selects a node
     */
    selectNodeCallback: (node: ModalTableauxTreeLayoutNode) => void;
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
    /**
     * Whether or not the tree waits for the user to choose a leaf
     */
    leafSelection: boolean;
}

const SMTabNode: preact.FunctionalComponent<Props> = ({
    node,
    nodes,
    selected,
    selectedNodeId,
    selectNodeCallback,
    dragTransform,
    onDrag,
    zoomFactor,
    leafSelection,
}) => {
    const textRef = useRef<SVGTextElement>();

    // Uses parameter isClosed to determine if the Node should be selectable
    const nodeIsClickable = !node.data.isClosed;

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
                class={classMap({
                    [style.nodeSelectLemma]:
                        leafSelection &&
                        selectedNodeId !== undefined &&
                        isChildOf(node.data, nodes[selectedNodeId], nodes) &&
                        node.data.children.length <= 0,
                })}
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
                {nodeName(node.data)}
            </text>
        </Draggable>
    );
};

export default SMTabNode;
