import {h, RefObject} from "preact";
import {useEffect, useState} from "preact/hooks";

import {classMap} from "../../../util/class-map";

import * as style from "./style.scss";

interface Props {
    /**
     * A reference to the element which is supposed to have a rectangle background
     */
    elementRef: RefObject<SVGGraphicsElement>;
    /**
     * Whether the rectangle has a disabled-style
     */
    disabled: boolean;
    /**
     * Whether the rectangle has a selected-style
     */
    selected: boolean;
    /**
     * Any specific styles
     */
    class?: string;
}

const SmallRec: preact.FunctionalComponent<Props> = ({
    elementRef,
    disabled,
    selected,
    class: className = "",
}) => {
    const [dims, setDims] = useState({ x: 0, y: 0, height: 0, width: 0 });

    useEffect(() => {
        if (!elementRef.current) {
            return;
        }

        const box = elementRef.current.getBBox();
        box.width += 4;
        box.x -= 2;
        setDims(box);
    });

    return (
        <rect
            className={classMap({
                [style.active]: !disabled,
                [style.disabled]: disabled,
                [style.selected]: selected,
                [className]: className,
            })}
            x={dims.x}
            y={dims.y}
            width={dims.width}
            height={dims.height}
            rx="4"
        />
    );
};

export default SmallRec;
