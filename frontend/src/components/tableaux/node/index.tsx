import { createRef, h } from "preact";

import { classMap } from "../../../helpers/class-map";
import { disableDrag, enableDrag } from "../../../helpers/zoom/drag";
import { mousePos } from "../../../helpers/zoom/mouse";
import { LayoutItem } from "../../../types/layout";
import { TableauxTreeLayoutNode } from "../../../types/tableaux";
import { DragTransform } from "../../../types/ui";
import Rectangle from "../../rectangle";
import * as style from "./style.scss";

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
    dragTransform: DragTransform;
    onDrag: (id: number, dt: DragTransform) => void;
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
    const textRef = createRef<SVGTextElement>();

    // The nodes name which is displayed
    const name = `${node.data.negated ? "¬" : ""}${node.data.spelling}`;

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

    const onMouseDown = (ev: MouseEvent) => {
        if (ev.button) {
            return;
        }
        if (!textRef.current) {
            return;
        }
        ev.preventDefault();
        ev.stopPropagation();

        const svg = textRef.current.ownerSVGElement!;

        disableDrag();

        const x = ev.clientX;
        const y = ev.clientY;

        let moved = false;

        const oldDt = dragTransform;

        const p0 = mousePos(svg, ev);

        const onMouseMoved = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (!moved) {
                const xChange = e.clientX - x;
                const yChange = e.clientY - y;
                moved = xChange * xChange + yChange * yChange > 0;
            }

            const p = mousePos(svg, e);

            const dx = (p[0] - p0[0]) / zoomFactor;
            const dy = (p[1] - p0[1]) / zoomFactor;

            onDrag(node.data.id, {
                x: oldDt.x + dx,
                y: oldDt.y + dy,
            });
        };

        const onMouseUpped = (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            enableDrag(moved);

            window.removeEventListener("mousemove", onMouseMoved);
            window.removeEventListener("mouseup", onMouseUpped);
        };

        window.addEventListener("mousemove", onMouseMoved);
        window.addEventListener("mouseup", onMouseUpped);
    };

    return (
        <g
            onClick={handleClick}
            class={classMap({
                [style.node]: true,
                [style.nodeClosed]: node.data.isClosed && !lemmaNodesSelectable,
                [style.nodeClickable]: nodeIsClickable,
            })}
            onMouseDown={onMouseDown}
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
                {name}
            </text>
        </g>
    );
};

export default TableauxTreeNode;
