import { Component, ComponentChildren, createRef, h } from "preact";
import { disableDrag, enableDrag } from "../../helpers/zoom/drag";
import { extent } from "../../helpers/zoom/extent";
import { Gesture } from "../../helpers/zoom/gesture";
import { mousePos } from "../../helpers/zoom/mouse";
import { dist } from "../../helpers/zoom/point";
import { touchPos } from "../../helpers/zoom/touch";
import { constrain, IDENTITY, invert } from "../../helpers/zoom/transform";
import { Extent, GoToEvent, Point, Transform } from "../../types/ui";

export const SUPPORTS_TOUCH =
    navigator.maxTouchPoints || "ontouchstart" in globalThis;

// const filterMouseEvent = (e: MouseEvent) => !e.button;
// const filterTouchEvent = (e: TouchEvent) => !e.ctrlKey;

interface State {
    transform: Transform;
    gesture?: Gesture;
}

interface Props {
    transformGoTo?: (detail: any) => [number, number];
    class?: string;
    width?: string;
    height?: string;
    style?: string;
    viewBox?: string;
    preserveAspectRatio?: string;
    children: (transform: Transform, center: () => void) => ComponentChildren;
}

function translate(transform: Transform, p0: Point, p1: Point) {
    const x = p0[0] - p1[0] * transform.k;
    const y = p0[1] - p1[1] * transform.k;
    return x === transform.x && y === transform.y
        ? transform
        : { k: transform.k, x, y };
}

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
    [Infinity, Infinity]
];

export default class Zoomable extends Component<Props, State> {
    public state: State = {
        transform: IDENTITY
    };

    public ref = createRef<SVGSVGElement>();
    public touchStarting?: number;
    public touchEnding?: number;

    public onWheel = (e: WheelEvent) => {
        if (!this.ref.current) {
            return;
        }
        const ext = extent(this.ref.current);
        const p = mousePos(this.ref.current, e);
        const g = this.state.gesture || new Gesture(ext);
        let t = this.state.transform;
        const k = Math.max(
            scaleExtent[0],
            Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta(e)))
        );

        if (g.wheel) {
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

        t = constrain(
            translate(scale(t, k), g.mouse![0], g.mouse![1]),
            ext,
            translateExtent
        );
        g.zoom("mouse", t);

        g.wheel = (setTimeout(() => {
            g.wheel = undefined;
        }, 150) as unknown) as number;

        this.setState({ transform: t, gesture: g });
    };

    public onMouseDown = (ev: MouseEvent) => {
        if (!this.ref.current) {
            return;
        }
        ev.stopImmediatePropagation();

        disableDrag();

        const svg = this.ref.current;

        const ext = extent(this.ref.current);
        const g = new Gesture(ext);
        const p = mousePos(this.ref.current, ev);
        const t = this.state.transform;
        const { clientX: x0, clientY: y0 } = ev;

        g.mouse = [p, invert(t, p)];

        const mouseMoved = (e: MouseEvent) => {
            e.stopImmediatePropagation();
            e.preventDefault();
            if (!g.moved) {
                const dx = e.clientX - x0;
                const dy = e.clientY - y0;
                g.moved = dx * dx + dy * dy > 0;
            }
            g.mouse![0] = mousePos(svg, e);
            const newT = constrain(
                translate(t, g.mouse![0], g.mouse![1]),
                ext,
                translateExtent
            );
            g.zoom("mouse", newT);
            this.setState({ transform: newT, gesture: g });
        };

        const mouseUpped = (e: MouseEvent) => {
            e.stopImmediatePropagation();
            e.preventDefault();
            window.removeEventListener("mousemove", mouseMoved);
            window.removeEventListener("mouseup", mouseUpped);
            enableDrag(g.moved || false);
        };

        window.addEventListener("mousemove", mouseMoved);
        window.addEventListener("mouseup", mouseUpped);
    };

    public onDblClick = (e: MouseEvent) => {
        console.log(e);
    };

    public onTouchStart = (e: TouchEvent) => {
        e.stopImmediatePropagation();
        if (!this.ref.current) {
            return;
        }
        const svg = this.ref.current;
        const ext = extent(svg);
        const touches = e.touches;
        const n = touches.length;
        const g =
            e.changedTouches.length === n && this.state.gesture
                ? this.state.gesture
                : new Gesture(ext);
        const t = this.state.transform;

        let started = false;

        for (let i = 0; i < n; i++) {
            const touch = touches[i];
            const p = touchPos(svg, touches, touch.identifier);
            if (!p) {
                continue;
            }
            const t0: [Point, Point, number] = [
                p,
                invert(t, p),
                touch.identifier
            ];
            if (!g.touch0) {
                g.touch0 = t0;
                started = true;
                g.taps = this.touchStarting ? 2 : 1;
            } else if (!g.touch1 && g.touch0[2] !== t0[2]) {
                g.touch1 = t0;
                g.taps = 0;
            }
        }

        if (this.touchStarting) {
            clearTimeout(this.touchStarting);
            this.touchStarting = undefined;
        }

        if (started && g.taps < 2) {
            this.touchStarting = (setTimeout(
                () => (this.touchStarting = undefined),
                500
            ) as unknown) as number;
        }

        this.setState({ transform: t, gesture: g });
    };

    public onTouchMove = (e: TouchEvent) => {
        let t = this.state.transform;
        const svg = this.ref.current;
        if (!svg) {
            return;
        }

        const ext = extent(svg);
        const g = this.state.gesture || new Gesture(ext);
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
            if (g.touch0 && g.touch0[2] === touch.identifier) {
                g.touch0[0] = p;
            } else if (g.touch1 && g.touch1[2] === touch.identifier) {
                g.touch1[0] = p;
            }
        }

        if (g.touch0 && g.touch1) {
            const p0 = g.touch0[0];
            const l0 = g.touch0[1];
            const p1 = g.touch1[0];
            const l1 = g.touch1[1];
            const dp = dist(p0, p1);
            const dl = dist(l0, l1);

            t = scale(t, Math.sqrt(dp / dl));
            p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
            l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
        } else if (g.touch0) {
            p = g.touch0[0];
            l = g.touch0[1];
        } else {
            return;
        }

        this.setState({
            gesture: g,
            transform: constrain(translate(t, p, l), g.extent, translateExtent)
        });
    };

    public onTouchEnd = (e: TouchEvent) => {
        const t = this.state.transform;
        const svg = this.ref.current;
        if (!svg) {
            return;
        }
        const ext = extent(svg);
        const g = this.state.gesture || new Gesture(ext);
        const touches = e.changedTouches;
        const n = touches.length;

        e.stopImmediatePropagation();

        if (this.touchEnding) {
            clearTimeout(this.touchEnding);
            this.touchEnding = undefined;
        }

        this.touchEnding = (setTimeout(
            () => (this.touchEnding = undefined),
            500
        ) as unknown) as number;

        for (let i = 0; i < n; i++) {
            const touch = touches[i];
            if (g.touch0 && g.touch0[2] === touch.identifier) {
                delete g.touch0;
            } else if (g.touch1 && g.touch1[2] === touch.identifier) {
                delete g.touch1;
            }
        }

        if (g.touch1 && !g.touch0) {
            g.touch0 = g.touch1;
            delete g.touch1;
        }
        if (g.touch0) {
            g.touch0[1] = invert(t, g.touch0[0]);
        }
    };

    public setTransform = (t: Transform) =>
        this.setState(s => ({ ...s, transform: t }));

    public handleGoTo = (e: Event) => {
        const { detail } = e as GoToEvent;
        if (!this.props.transformGoTo) {
            return;
        }
        const [x, y] = this.props.transformGoTo(detail);
        this.setTransform({ x, y, k: 1 });
    };

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
                onDblClick={this.onDblClick}
                onTouchStart={this.onTouchStart}
                onTouchMove={this.onTouchMove}
                onTouchEnd={this.onTouchEnd}
                onTouchCancel={this.onTouchEnd}
            >
                {children(transform, this.handleCenter)}
            </svg>
        );
    }
}
