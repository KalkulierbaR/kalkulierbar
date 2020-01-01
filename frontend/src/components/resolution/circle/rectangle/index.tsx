import {h, RefObject} from "preact";
import {useEffect, useState} from "preact/hooks";
import {classMap} from "../../../../helpers/class-map";
import * as style from "../style.css";

interface Props {
    /**
     * The text element reference
     */
    textRef: RefObject<SVGTextElement>;
    /**
     * Whether the rectangle has a disabled-style
     */
    disabled: boolean;
    /**
     * Whether the rectangle has a selected-style
     */
    selected: boolean;
}

const Rectangle: preact.FunctionalComponent<Props> = ({
    textRef,
    disabled,
    selected
}) => {

    const [dims, setDims] = useState({ x: 0, y: 0, height: 0, width: 0 });

    useEffect(() => {
        if (!textRef.current) {
            return;
        }

        const box = textRef.current.getBBox();
        box.width += 16;
        box.x -= 8;
        box.height += 8;
        box.y -= 4;
        setDims(box);
    });

    return (
        <rect
            className={classMap({
                [style.active]: !disabled,
                [style.disabled]: disabled,
                [style.rectSelected]: selected,
            })}
            x={dims.x}
            y={dims.y}
            width={dims.width}
            height={dims.height}
            rx="4"
        />
    );
};

export default Rectangle;
