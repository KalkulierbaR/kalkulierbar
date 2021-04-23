import {h} from "preact";
import {PropRef, useState} from "preact/hooks";

import {DragTransform, Point} from "../../../types/ui";
import {disableDrag, enableDrag} from "../../../util/zoom/drag";
import {mousePos} from "../../../util/zoom/mouse";
import {touchPos} from "../../../util/zoom/touch";

interface Props {
    /**
     * The element's reference
     */
    elementRef: PropRef<SVGElement>;
    /**
     * The element's id
     */
    id: number;
    /**
     * The function to perform when the element is clicked
     */
    onClick: () => void;
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
     * Any additional class for styling
     */
    class?: string;
}

const Draggable: preact.FunctionalComponent<Props> = ({
    id,
    class: className,
    elementRef,
    dragTransform,
    onDrag,
    zoomFactor,
    onClick,
    children,
}) => {
    const [oldTouchDt, setOldDt] = useState<DragTransform>({ x: 0, y: 0 });
    const [touch0, setTouch0] = useState<Point | undefined>(undefined);

    /**
     * The event triggered when the mouse is clicked
     * @param {MouseEvent} ev - The mouse event
     * @returns {void}
     */

    const onMouseDown = (ev: MouseEvent) => {
        // Do nothing when the right mouse button is clicked
        if (ev.button) {
            return;
        }
        if (!elementRef.current) {
            return;
        }
        ev.preventDefault();
        ev.stopPropagation();

        const svg = elementRef.current.ownerSVGElement!;

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
                moved = xChange * xChange + yChange * yChange > 10;
            }

            // Calculate how much we have moved (consider the zoom!)
            const p = mousePos(svg, e);

            const dx = (p[0] - p0[0]) / zoomFactor;
            const dy = (p[1] - p0[1]) / zoomFactor;

            // Update drag transform
            onDrag(id, {
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

    /**
     * The event triggered when the user does a touch
     * @param {TouchEvent} e - The touch event
     * @returns {void}
     */

    const onTouchStart = (e: TouchEvent) => {
        if (!elementRef.current) {
            return;
        }

        // We only care if the user uses one finger
        if (e.touches.length !== 1) {
            return;
        }

        e.stopPropagation();
        e.preventDefault();

        disableDrag();

        const svg = elementRef.current.ownerSVGElement!;

        const touch = e.touches[0];

        // Store old drag
        setOldDt(dragTransform);

        const p0 = touchPos(svg, e.touches, touch.identifier);

        // Store start pos
        setTouch0(p0!);
    };

    /**
     * The event triggered when the user does a touch move
     * @param {TouchEvent} e - The touch event
     * @returns {void}
     */

    const onTouchMove = (e: TouchEvent) => {
        if (!elementRef.current || !touch0) {
            return;
        }

        // We only care if the user uses one finger
        if (e.changedTouches.length !== 1) {
            return;
        }

        const svg = elementRef.current.ownerSVGElement!;

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
        onDrag(id, { x: oldTouchDt.x + dx, y: oldTouchDt.y + dy });
    };

    /**
     * The event triggered when the user ends a touch
     * @returns {void}
     */

    const onTouchEnd = () => {
        // Calculate if we moved
        const dx = dragTransform.x - oldTouchDt.x;
        const dy = dragTransform.y - oldTouchDt.y;

        const moved = dx * dx + dy * dy > 10;

        enableDrag(moved);

        // If we haven't moved, just say it was a click
        if (!moved) {
            onClick();
        }

        setTouch0(undefined);
    };

    return (
        <g
            onClick={onClick}
            class={className}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {children}
        </g>
    );
};

export default Draggable;
