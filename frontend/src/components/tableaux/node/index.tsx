import { HierarchyNode } from "d3";
import { createRef, h } from "preact";
import { useState } from "preact/hooks";
import { D3Data } from "../tree";

import * as style from "./style.css";

/**
 * Properties Interface for the TableauxTreeNode component
 */
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
     * The function to call, when the user selects this node
     */
    selectNodeCallback: (node: D3Data) => void;
}

/*
 * A component representing a single Node of a TableauxTree
 */
const TableauxTreeNode: preact.FunctionalComponent<Props> = ({
    node,
    selectNodeCallback,
    selected
}) => {
    const [dims, setDims] = useState({ x: 0, y: 0, height: 0, width: 0 });
    
    const ref = createRef<SVGTextElement>();

    // The nodes name which is displayed
    const name = `${node.data.negated ? "!" : ""}${node.data.name}`;

    /**
     * Handle the onClick event of the node
     * @returns {void}
     */
    const handleClick = () => {
        if (ref.current) {
            const box = ref.current.getBBox();
            box.width += 4;
            box.x -= 2;
            setDims(box);
        }
        selectNodeCallback(node.data);
    };

    const { width, height, x: bgX, y: bgY } = dims;

    // The nodes background based upon if the node is selected
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
                class={
                    style.node + (node.data.isClosed ? " " + style.closed : " ")
                }
                onClick={handleClick}
                x={(node as any).x}
                y={(node as any).y}
            >
                {name}
            </text>
        </g>
    );
};

export default TableauxTreeNode;
