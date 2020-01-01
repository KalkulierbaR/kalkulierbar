import { HierarchyNode } from "d3";
import { createRef, h } from "preact";
import { D3Data } from "../tree";

import Rectangle from "../../rectangle";
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
     * The function to call, when the user selects this node
     */
    selectNodeCallback: (node: D3Data) => void;
}

// Component representing a single Node of a TableauxTree
const TableauxTreeNode: preact.FunctionalComponent<Props> = ({
    node,
    selected,
    selectNodeCallback
}) => {
    const textRef = createRef<SVGTextElement>();

    // The nodes name which is displayed
    const name = `${node.data.negated ? "¬" : ""}${node.data.name}`;

    /**
     * Handle the onClick event of the node
     * @returns {void}
     */
    const handleClick = () => {
        if (!node.data.isClosed) {
            selectNodeCallback(node.data);
        }
    };

    return (
        <g
            onClick={handleClick}
            class={node.data.isClosed ? style.nodeClosed : style.node}
        >
            <Rectangle
                elementRef={textRef}
                disabled={node.data.isClosed}
                selected={selected}
            />
            <text
                ref={textRef}
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
