import { createRef, h } from "preact";
import { useState } from "preact/hooks";

import { CandidateClause } from "../../../../types/calculus/clause";
import { DragTransform, Point } from "../../../../types/ui";
import { classMap } from "../../../../util/class-map";
import { clauseToString } from "../../../../util/clause";
import { disableDrag, enableDrag } from "../../../../util/zoom/drag";
import { mousePos } from "../../../../util/zoom/mouse";
import { touchPos } from "../../../../util/zoom/touch";
import Rectangle from "../../../svg/rectangle";

import * as style from "./style.scss";

interface Props {
    /**
     * Boolean to change the style of the node if it is selected
     */
    selected: boolean;
    /**
     * Boolean representing if the node is currently disabled
     */
    disabled: boolean;
    /**
     * The function to call, when the user selects this node
     */
    selectCallback: (index: number) => void;
    /**
     * Where to place the node
     */
    coordinates: [number, number];
    /**
     * Which clause should be the text of the node
     */
    clause: CandidateClause;
    /**
     * Boolean representing if the node is the newest resolvent
     */
    isNew: boolean;
    /**
     * Whether the node should be highlighted as secondary
     */
    semiSelected: boolean;
    /**
     * Current zoom factor of the SVG (needed for drag computation)
     */
    zoomFactor: number;
    /**
     * The function to call, when the user drops a node after dragging it
     */
    onDrop: (id: number, p: DragTransform) => void;
    /**
     * The index of the node in the circle layout
     */
    indexInCircle: number;
}

const ResolutionNode: preact.FunctionalComponent<Props> = ({
    selected,
    disabled,
    selectCallback,
    coordinates,
    clause,
    isNew,
    semiSelected,
    zoomFactor,
    onDrop,
    indexInCircle,
}) => {
    const textRef = createRef<SVGTextElement>();

    const [dt, setDt] = useState<DragTransform>({ x: 0, y: 0 });
    const [oldTouchDt, setOldDt] = useState<DragTransform>({ x: 0, y: 0 });
    const [touch0, setTouch0] = useState<Point | undefined>(undefined);

    /**
     * Handle a click on the node
     * @returns {void}
     */
    const handleClick = () => {
        if (disabled) {
            return;
        }
        selectCallback(clause.index);
    };

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
        const oldDt = dt;

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
            setDt({
                x: oldDt.x + dx,
                y: oldDt.y + dy,
            });
        };

        // Handle end of mouse move
        const onMouseUpped = (e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();

            // Calculate how much we have moved (consider the zoom!)
            const p = mousePos(svg, e);

            const dx = (p[0] - p0[0]) / zoomFactor;
            const dy = (p[1] - p0[1]) / zoomFactor;

            onDrop(indexInCircle, { x: oldDt.x + dx, y: oldDt.y + dy });
            setDt({ x: 0, y: 0 });

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
        setOldDt(dt);

        const p0 = touchPos(svg, e.touches, touch.identifier);

        // Store start pos
        setTouch0(p0!);
    };

    /**
     * Handle a user touch event
     * @param {TouchEvent} e - The touch event
     * @param {boolean} moving - Whether the touch is still moving
     * @returns {void}
     */
    const handleTouchEvent = (e: TouchEvent, moving: boolean) => {
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

        if (moving) {
            // Update drag transform
            setDt({ x: oldTouchDt.x + dx, y: oldTouchDt.y + dy });
            return;
        }

        const moved = dx * dx + dy * dy > 0;

        enableDrag(moved);

        onDrop(indexInCircle, { x: oldTouchDt.x + dx, y: oldTouchDt.y + dy });
        setDt({ x: 0, y: 0 });

        // If we haven't moved, just say it was a click
        if (!moved) {
            handleClick();
        }

        setTouch0(undefined);
    };

    /**
     * The event triggered when the user does a touch move
     * @param {TouchEvent} e - The touch event
     * @returns {void}
     */
    const onTouchMove = (e: TouchEvent) => {
        handleTouchEvent(e, true);
    };

    /**
     * The event triggered when the user ends a touch
     * @param {TouchEvent} e - The touch event
     * @returns {void}
     */
    const onTouchEnd = (e: TouchEvent) => {
        handleTouchEvent(e, false);
    };

    return (
        <g
            onClick={handleClick}
            class={disabled ? style.nodeDisabled : style.node}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            transform={`translate(${dt.x} ${dt.y})`}
        >
            <Rectangle
                elementRef={textRef}
                disabled={disabled}
                selected={selected}
                class={classMap({
                    [style.nodeNew]: isNew && !selected && !disabled,
                    [style.semiSelected]: semiSelected,
                })}
            />
            <text
                x={coordinates[0]}
                y={coordinates[1]}
                text-anchor="middle"
                ref={textRef}
                class={classMap({
                    [style.textClosed]: disabled,
                    [style.textSelected]: selected,
                    [style.noTextHighlight]: true,
                })}
            >
                {clauseToString(clause.clause)}
            </text>
        </g>
    );
};

export default ResolutionNode;
