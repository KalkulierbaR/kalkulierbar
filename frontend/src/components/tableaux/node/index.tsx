import { HierarchyNode, select } from "d3";
import { createRef, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { D3Data } from "../tree";

import * as style from "./style.css";

/*
 * A single Node in the tree
 */
const TableauxTreeNode: preact.FunctionalComponent<{
    node: HierarchyNode<D3Data>;
}> = ({ node }) => {
    const [selected, setSelected] = useState(false);

    const [dims, setDims] = useState({ x: 0, y: 0, height: 0, width: 0 });

    const ref = createRef<SVGTextElement>();

    const handleClick = () => {
        if (ref.current) {
            const box = ref.current.getBBox();
            box.width += 4;
            box.x -= 2;
            setDims(box);
        }
        setSelected(s => !s);
    };

    const { width, height, x: bgX, y: bgY } = dims;

    const bg = selected ? (
        <rect
            class={style.bg}
            x={bgX}
            y={bgY}
            width={width}
            height={height}
            rx="4"
        />
    ) : null;

    return (
        <g>
            {bg}
            <text
                ref={ref}
                text-anchor="middle"
                class={style.node}
                onClick={handleClick}
                x={(node as any).x}
                y={(node as any).y}
            >
                {node.data.name}
            </text>
        </g>
    );
};

export default TableauxTreeNode;
