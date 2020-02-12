import { createRef, h } from "preact";

import { classMap } from "../../../helpers/class-map";
import { LayoutItem } from "../../../types/layout";
import { TableauxTreeLayoutNode } from "../../../types/tableaux";
import Rectangle from "../../rectangle";
import * as style from "./style.scss";

// Properties Interface for the TableauxTreeNode component
interface Props {
    /**
     * The single tree node to represent
     */
    node: LayoutItem<TableauxTreeLayoutNode>;
    /**
     * Boolean to change the style of the node if it is selected
     */
    selected: boolean;
    /**
     * The function to call, when the user selects this node
     */
    selectNodeCallback: (node: TableauxTreeLayoutNode) => void;
}

// Component representing a single Node of a TableauxTree
const TableauxTreeNode: preact.FunctionalComponent<Props> = ({
    node,
    selected,
    selectNodeCallback
}) => {
    const textRef = createRef<SVGTextElement>();

    // The nodes name which is displayed
    const name = `${node.data.negated ? "¬" : ""}${node.data.spelling}`;

    /**
     * Handle the onClick event of the node
     * @returns {void}
     */
    const handleClick = () => {
        selectNodeCallback(node.data);
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
                class={classMap({
                    [style.textSelected]: selected,
                    [style.textClosed]: node.data.isClosed
                })}
                x={node.x}
                y={node.y}
            >
                {name}
            </text>
        </g>
    );
};

export default TableauxTreeNode;
