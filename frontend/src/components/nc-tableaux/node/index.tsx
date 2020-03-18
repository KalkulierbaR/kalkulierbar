import { h } from "preact";
import { NCTabTreeNode } from "../../../types/nc-tableaux";
import { useRef, useState } from "preact/hooks";
import { Tree } from "../../../types/tree";
import Rectangle from "../../rectangle";
import { DragTransform, Point } from "../../../types/ui";
import { disableDrag, enableDrag } from "../../../util/zoom/drag";
import { mousePos } from "../../../util/zoom/mouse";
import { touchPos } from "../../../util/zoom/touch";
import { classMap } from "../../../util/class-map";

import * as style from "./style.scss";

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

    const [oldTouchDt, setOldDt] = useState<DragTransform>({ x: 0, y: 0 });
    const [touch0, setTouch0] = useState<Point | undefined>(undefined);

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
                [style.nodeClosed]: node.data.isClosed,
                [style.nodeClickable]: nodeIsClickable,
            })}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
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
        </g>
    );
};

export default NCTabNode;
