import { createRef, h } from "preact";

import { useState } from "preact/hooks";
import { classMap } from "../../../helpers/class-map";
import { disableDrag, enableDrag } from "../../../helpers/zoom/drag";
import { mousePos } from "../../../helpers/zoom/mouse";
import { touchPos } from "../../../helpers/zoom/touch";
import { LayoutItem } from "../../../types/layout";
import { TableauxTreeLayoutNode } from "../../../types/tableaux";
import { DragTransform, Point } from "../../../types/ui";
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
    const textRef = createRef<SVGTextElement>();

    const [oldTouchDt, setOldDt] = useState<DragTransform>({ x: 0, y: 0 });
    const [touch0, setTouch0] = useState<Point | undefined>(undefined);

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
        // Do nothing when the right mouse button is clicked
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

        // Get the previous transform
        const oldDt = dragTransform;

        // Get start pos
        const p0 = mousePos(svg, ev);

        // Handle mouse movement
        const onMouseMoved = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // Check if we moved
            if (!moved) {
                const xChange = e.clientX - x;
                const yChange = e.clientY - y;
                moved = xChange * xChange + yChange * yChange > 0;
            }

            // Calculate how much we have moved (consider the zoom!)
            const p = mousePos(svg, e);

            const dx = (p[0] - p0[0]) / zoomFactor;
            const dy = (p[1] - p0[1]) / zoomFactor;

            // Update drag transform
            onDrag(node.data.id, {
                x: oldDt.x + dx,
                y: oldDt.y + dy,
            });
        };

        // Handle end of mouse move
        const onMouseUpped = (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();

            // Enable drag and ignore clicks if we moved
            enableDrag(moved);

            window.removeEventListener("mousemove", onMouseMoved);
            window.removeEventListener("mouseup", onMouseUpped);
        };

        window.addEventListener("mousemove", onMouseMoved);
        window.addEventListener("mouseup", onMouseUpped);
    };

    const onTouchStart = (e: TouchEvent) => {
        if (!textRef.current) {
            return;
        }

        // We only care if the user uses one finger
        if (e.touches.length !== 1) {
            return;
        }

        e.stopPropagation();
        e.preventDefault();

        disableDrag();

        const svg = textRef.current.ownerSVGElement!;

        const touch = e.touches[0];

        // Store old drag
        setOldDt(dragTransform);

        const p0 = touchPos(svg, e.touches, touch.identifier);

        // Store start pos
        setTouch0(p0!);
    };

    const onTouchMove = (e: TouchEvent) => {
        if (!textRef.current || !touch0) {
            return;
        }

        // We only care if the user uses one finger
        if (e.changedTouches.length !== 1) {
            return;
        }

        const svg = textRef.current.ownerSVGElement!;

        const touch = e.changedTouches[0];

        const t = touchPos(svg, e.changedTouches, touch.identifier);

        if (!t) {
            return;
        }

        e.stopPropagation();
        e.preventDefault();

        // Calculate how much we have moved (consider the zoom!)
        const dx = (t[0] - touch0[0]) / zoomFactor;
        const dy = (t[1] - touch0[1]) / zoomFactor;

        // Update drag transform
        onDrag(node.data.id, { x: oldTouchDt.x + dx, y: oldTouchDt.y + dy });
    };

    const onTouchEnd = () => {
        // Calculate if we moved
        const dx = dragTransform.x - oldTouchDt.x;
        const dy = dragTransform.y - oldTouchDt.y;

        const moved = dx * dx + dy * dy > 0;

        enableDrag(moved);

        // If we haven't moved, just say it was a click
        if (!moved) {
            handleClick();
        }

        setTouch0(undefined);
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
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
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
