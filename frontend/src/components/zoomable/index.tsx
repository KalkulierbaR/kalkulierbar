import { Component, ComponentChildren, createRef, h } from "preact";
import { disableDrag, enableDrag } from "../../helpers/zoom/drag";
import { extent } from "../../helpers/zoom/extent";
import { Gesture } from "../../helpers/zoom/gesture";
import { mousePos } from "../../helpers/zoom/mouse";
import { constrain, IDENTITY, invert } from "../../helpers/zoom/transform";
import { Extent, Point, Transform } from "../../types/ui";

export const SUPPORTS_TOUCH =
    navigator.maxTouchPoints || "ontouchstart" in globalThis;

// const filterMouseEvent = (e: MouseEvent) => !e.button;
// const filterTouchEvent = (e: TouchEvent) => !e.ctrlKey;

interface State {
    transform: Transform;
    gesture?: Gesture;
}

interface Props {
    class?: string;
    width?: string;
    height?: string;
    style?: string;
    viewBox?: string;
    preserveAspectRatio?: string;
    children: (transform: Transform) => ComponentChildren;
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
        console.log(e);
    };
    public onTouchMove = (e: TouchEvent) => {
        console.log(e);
    };
    public onTouchEnd = (e: TouchEvent) => {
        console.log(e);
    };

    public render(
        {
            children,
            class: className,
            width,
            height,
            style,
            viewBox,
            preserveAspectRatio
        }: Props,
        { transform }: State
    ) {
        return (
            <svg
                ref={this.ref}
                class={className}
                width={width}
                height={height}
                style={style}
                viewBox={viewBox}
                preserveAspectRatio={preserveAspectRatio}
                onWheel={this.onWheel}
                onMouseDown={this.onMouseDown}
                onDblClick={this.onDblClick}
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
