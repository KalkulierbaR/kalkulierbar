import { HierarchyNode } from "d3";
import { createRef, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { D3Data } from "../tree";

import * as style from "./style.css";

// Properties Interface for the TableauxTreeNode component
interface Props {
    /**
     * The single tree node to represent
     */
    node: HierarchyNode<D3Data>;
    /**
     * Boolean to change the style of the node if it is selected
     */
    selected: boolean;
    /**
     * Style for the rectangle's filling of this node
     */
    filling: string;
    /**
     * The function to call, when the user selects this node
     */
    selectNodeCallback: (node: D3Data) => void;
}

// Component representing a single Node of a TableauxTree
const TableauxTreeNode: preact.FunctionalComponent<Props> = ({
    node,
    selected,
    filling,
    selectNodeCallback
}) => {
    const [dims, setDims] = useState({ x: 0, y: 0, height: 0, width: 0 });

    const ref = createRef<SVGTextElement>();

    // The nodes name which is displayed
    const name = `${node.data.negated ? "¬" : ""}${node.data.name}`;

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const box = ref.current.getBBox();
        box.width += 16;
        box.x -= 8;
        box.height += 8;
        box.y -= 4;
        setDims(box);
    });

    /**
     * Handle the onClick event of the node
     * @returns {void}
     */
    const handleClick = () => {
        if (!node.data.isClosed) {
            selectNodeCallback(node.data);
        }
    };

    const { width, height, x: bgX, y: bgY } = dims;

    return (
        <g
            onClick={handleClick}
            class={node.data.isClosed ? style.nodeClosed : style.node}
        >
            <rect
                class={filling + " " + (selected ? style.rectSelected : "")}
                x={bgX}
                y={bgY}
                width={width}
                height={height}
                rx="4"
            />
            <text
                ref={ref}
                text-anchor="middle"
                class={node.data.isClosed ? style.textClosed : ""}
                x={(node as any).x}
                y={(node as any).y}
            >
                {name}
            </text>
        </g>
    );
};

export default TableauxTreeNode;
