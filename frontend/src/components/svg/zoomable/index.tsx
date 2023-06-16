import { Component, ComponentChildren, createRef } from "preact";

import { Extent, GoToEvent, Point, Transform } from "../../../types/ui";
import { disableDrag, enableDrag } from "../../../util/zoom/drag";
import { extent } from "../../../util/zoom/extent";
import { Gesture } from "../../../util/zoom/gesture";
import { mousePos } from "../../../util/zoom/mouse";
import { dist } from "../../../util/zoom/point";
import { touchPos } from "../../../util/zoom/touch";
import { constrain, IDENTITY, invert } from "../../../util/zoom/transform";

// Zoom algorithms taken from d3-zoom

export const SUPPORTS_TOUCH =
    navigator.maxTouchPoints || "ontouchstart" in globalThis;

const filterMouseEvent = (e: MouseEvent) => !e.button;
// const filterTouchEvent = (e: TouchEvent) => !e.ctrlKey;

interface State {
    /**
     * The current transform
     */
    transform: Transform;
    /**
     * The current gesture being executed
     */
    gesture?: Gesture;
}

interface Props {
    /**
     * Transformer to handle GoToEvents
     */
    transformGoTo?: (detail: unknown) => [number, number];
    /**
     * Additional class for styling
     */
    class?: string;
    /**
     * The width of the SVG element
     */
    width?: string;
    /**
     * The height of the SVG element
     */
    height?: string;
    /**
     * The style for the SVG element
     */
    style?: string;
    /**
     * The viewBox of the SVG element
     */
    viewBox?: string;
    /**
     * See the SVG attribute
     */
    preserveAspectRatio?: string;
    /**
     * A function that maps a transform to children
     */
    children: (transform: Transform) => ComponentChildren;
}

/**
 * Creates a transform with the same `k` as `transform` that transforms `p1` to `p0`
 * @param {Transform} transform - The original transform
 * @param {Point} p0 - First point
 * @param {Point} p1 - Second point
 * @returns {Transform} - The translated transform
 */
function translate(transform: Transform, p0: Point, p1: Point) {
    const x = p0[0] - p1[0] * transform.k;
    const y = p0[1] - p1[1] * transform.k;
    return x === transform.x && y === transform.y
        ? transform
        : { k: transform.k, x, y };
}

/**
 * Replaces a transforms `k`
 * @param {Transform} transform - The transform to scale
 * @param {number} k - The new scale
 * @returns {Transform} - Scaled transform
 */
function scale(transform: Transform, k: number) {
    k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
    return k === transform.k
        ? transform
        : { k, x: transform.x, y: transform.y };
}

const wheelDelta = (event: WheelEvent) =>
    -event.deltaY *
    (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002);

const scaleExtent = [0, Infinity];
const translateExtent: Extent = [
    [-Infinity, -Infinity],
    [Infinity, Infinity],
];

export default class Zoomable extends Component<Props, State> {
    public state: State = {
        transform: IDENTITY,
    };

    public ref = createRef<SVGSVGElement>();
    public touchStarting?: number;
    public touchEnding?: number;

    public onWheel = (e: WheelEvent) => {
        if (!this.ref.current) {
            return;
        }
        // Get the extent (size) of our svg element
        const ext = extent(this.ref.current);
        // Get the current mouse position
        const p = mousePos(this.ref.current, e);
        // If we already have a gesture, reuse it
        const g = this.state.gesture || new Gesture(ext);
        let t = this.state.transform;
        // The new scale
        const k = Math.max(
            scaleExtent[0],
            Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta(e))),
        );

        // If we already have a wheel event in g, reuse it
        if (g.wheel) {
            // Update the saved mouse position if necessary
            if (g.mouse![0][0] !== p[0] || g.mouse![0][1] !== p[1]) {
                g.mouse![0] = p;
                g.mouse![1] = invert(t, p);
            }
            clearTimeout(g.wheel);
        } else if (t.k === k) {
            return;
        } else {
            g.mouse = [p, invert(t, p)];
        }

        // Calculate the new transform
        t = constrain(
            translate(scale(t, k), g.mouse![0], g.mouse![1]),
            ext,
            translateExtent,
        );
        // Save it on our gesture
        g.zoom("mouse", t);

        // Remove our wheel event after some time
        g.wheel = setTimeout(() => {
            g.wheel = undefined;
        }, 150) as unknown as number;

        // Propagate changes, re-render
        this.setState({ transform: t, gesture: g });
    };

    public onMouseDown = (ev: MouseEvent) => {
        // Ignore right click, etc.
        if (!filterMouseEvent(ev)) {
            return;
        }
        if (!this.ref.current) {
            return;
        }
        ev.stopImmediatePropagation();

        disableDrag();

        const svg = this.ref.current;

        // Get the extent (size) of our svg element
        const ext = extent(this.ref.current);
        // Always create a new gesture
        const g = new Gesture(ext);
        // Get current mouse position
        const p = mousePos(this.ref.current, ev);
        const t = this.state.transform;
        const { clientX: x0, clientY: y0 } = ev;

        // Save it on our gesture
        g.mouse = [p, invert(t, p)];

        const mouseMoved = (e: MouseEvent) => {
            e.stopImmediatePropagation();
            e.preventDefault();
            // Have we moved?
            if (!g.moved) {
                const dx = e.clientX - x0;
                const dy = e.clientY - y0;
                g.moved = dx * dx + dy * dy > 0;
            }
            // Save new mouse pos
            g.mouse![0] = mousePos(svg, e);
            // Calculate new transform
            const newT = constrain(
                translate(t, g.mouse![0], g.mouse![1]),
                ext,
                translateExtent,
            );
            g.zoom("mouse", newT);
            this.setState({ transform: newT, gesture: g });
        };

        const mouseUpped = (e: MouseEvent) => {
            e.stopImmediatePropagation();
            e.preventDefault();
            window.removeEventListener("mousemove", mouseMoved);
            window.removeEventListener("mouseup", mouseUpped);
            // Enable drag again. If we have moved, ignore click events for now
            enableDrag(g.moved || false);
        };

        window.addEventListener("mousemove", mouseMoved);
        window.addEventListener("mouseup", mouseUpped);
    };

    public onTouchStart = (e: TouchEvent) => {
        e.stopImmediatePropagation();
        if (!this.ref.current) {
            return;
        }
        const svg = this.ref.current;
        // Get the extent (size) of our svg element
        const ext = extent(svg);
        const touches = e.touches;
        const n = touches.length;
        // Reuse our gesture if this is a new touch event
        const g =
            e.changedTouches.length === n && this.state.gesture
                ? this.state.gesture
                : new Gesture(ext);
        const t = this.state.transform;

        let started = false;

        for (let i = 0; i < n; i++) {
            const touch = touches[i];
            // Get current touch position
            const p = touchPos(svg, touches, touch.identifier);
            if (!p) {
                continue;
            }
            // Save the touch pos and its identifier
            const t0: [Point, Point, number] = [
                p,
                invert(t, p),
                touch.identifier,
            ];
            // If we have no touch stored, store it as the first
            if (!g.touch0) {
                g.touch0 = t0;
                started = true;
                g.taps = this.touchStarting ? 2 : 1;
            }
            // If we already have one touch, store the second
            else if (!g.touch1 && g.touch0[2] !== t0[2]) {
                g.touch1 = t0;
                g.taps = 0;
            }
        }

        if (this.touchStarting) {
            clearTimeout(this.touchStarting);
            this.touchStarting = undefined;
        }

        if (started && g.taps < 2) {
            this.touchStarting = setTimeout(
                () => (this.touchStarting = undefined),
                500,
            ) as unknown as number;
        }

        this.setState({ transform: t, gesture: g });
    };

    public onTouchMove = (e: TouchEvent) => {
        let t = this.state.transform;
        const svg = this.ref.current;
        if (!svg) {
            return;
        }

        // Get the extent (size) of our svg element
        const ext = extent(svg);
        const g = this.state.gesture || new Gesture(ext);
        // Look at changed touches!
        const touches = e.changedTouches;
        const n = touches.length;

        let p: Point | null;
        let l: Point;

        e.stopImmediatePropagation();
        e.preventDefault();

        if (this.touchStarting) {
            clearTimeout(this.touchStarting);
            this.touchStarting = undefined;
        }

        g.taps = 0;

        for (let i = 0; i < n; i++) {
            const touch = touches[i];
            p = touchPos(svg, touches, touch.identifier);
            if (!p) {
                continue;
            }
            // Update touch positions
            if (g.touch0 && g.touch0[2] === touch.identifier) {
                g.touch0[0] = p;
            } else if (g.touch1 && g.touch1[2] === touch.identifier) {
                g.touch1[0] = p;
            }
        }

        // Do we have two touches (=> zoom) or one (=> drag)
        if (g.touch0 && g.touch1) {
            const p0 = g.touch0[0];
            const l0 = g.touch0[1];
            const p1 = g.touch1[0];
            const l1 = g.touch1[1];
            // Distance between current touch positions
            const dp = dist(p0, p1);
            // Distance between start touch positions
            const dl = dist(l0, l1);

            // Zoom in or out
            t = scale(t, Math.sqrt(dp / dl));
            // Go to center between touches
            p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
            l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
        } else if (g.touch0) {
            // Just drag
            p = g.touch0[0];
            l = g.touch0[1];
        } else {
            return;
        }

        this.setState({
            gesture: g,
            transform: constrain(translate(t, p, l), g.extent, translateExtent),
        });
    };

    public onTouchEnd = (e: TouchEvent) => {
        const t = this.state.transform;
        const svg = this.ref.current;
        if (!svg) {
            return;
        }
        // Get the extent (size) of our svg element
        const ext = extent(svg);
        const g = this.state.gesture || new Gesture(ext);
        const touches = e.changedTouches;
        const n = touches.length;

        e.stopImmediatePropagation();

        if (this.touchEnding) {
            clearTimeout(this.touchEnding);
            this.touchEnding = undefined;
        }

        this.touchEnding = setTimeout(
            () => (this.touchEnding = undefined),
            500,
        ) as unknown as number;

        // Delete saved touches, that are gone
        for (let i = 0; i < n; i++) {
            const touch = touches[i];
            if (g.touch0 && g.touch0[2] === touch.identifier) {
                delete g.touch0;
            } else if (g.touch1 && g.touch1[2] === touch.identifier) {
                delete g.touch1;
            }
        }

        // If we just deleted the first touch, move it up
        if (g.touch1 && !g.touch0) {
            g.touch0 = g.touch1;
            delete g.touch1;
        }
        // Set new start pos at current position
        if (g.touch0) {
            g.touch0[1] = invert(t, g.touch0[0]);
        }
    };

    public setTransform = (t: Transform) =>
        this.setState((s) => ({ ...s, transform: t }));

    /**
     * Handle the GoToEvent
     * @param {Event} e - The event to handle
     * @returns {void} - void
     */
    public handleGoTo = (e: Event) => {
        const { detail } = e as GoToEvent;
        if (!this.props.transformGoTo) {
            return;
        }
        const [x, y] = this.props.transformGoTo(detail);
        this.setTransform({ x, y, k: 1 });
    };

    /**
     * Handle the CenterEvent
     * @returns {void} - void
     */
    public handleCenter = () => {
        this.setTransform(IDENTITY);
    };

    public componentDidMount() {
        window.addEventListener("go-to", this.handleGoTo);
        window.addEventListener("center", this.handleCenter);
    }

    public componentWillUnmount() {
        window.removeEventListener("go-to", this.handleGoTo);
        window.removeEventListener("center", this.handleCenter);
    }

    public render({ children, ...props }: Props, { transform }: State) {
        return (
            <svg
                ref={this.ref}
                {...props}
                onWheel={this.onWheel}
                onMouseDown={this.onMouseDown}
                onTouchStart={this.onTouchStart}
                onTouchMove={this.onTouchMove}
                onTouchEnd={this.onTouchEnd}
                onTouchCancel={this.onTouchEnd}
            >
                {children(transform)}
            </svg>
        );
    }
}
