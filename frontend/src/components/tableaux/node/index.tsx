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
    /**
     * Contains the Information, that potential Lemma nodes are selectable
     */
    lemmaNodesSelectable: boolean;
}

// Component representing a single Node of a TableauxTree
const TableauxTreeNode: preact.FunctionalComponent<Props> = ({
    node,
    selected,
    selectNodeCallback,
    lemmaNodesSelectable
}) => {
    const textRef = createRef<SVGTextElement>();

    // The nodes name which is displayed
    const name = `${node.data.negated ? "¬" : ""}${node.data.spelling}`;

    // Uses parameter lemmaNodesSelectable to determine if the Node should be selectable
    const nodeIsClickable = ((lemmaNodesSelectable && node.data.isClosed) ||
        (!lemmaNodesSelectable && !node.data.isClosed));
    /**
     * Handle the onClick event of the node
     * @returns {void}
     */
    const handleClick = () => {
        if(nodeIsClickable){
            selectNodeCallback(node.data);
        }
    };

    return (
        <g
            onClick={handleClick}
            class={classMap({
                [style.node]: true,
                [style.nodeClosed]: node.data.isClosed && !lemmaNodesSelectable,
                [style.nodeClickable]: nodeIsClickable
            })}
        >
            <Rectangle
                elementRef={textRef}
                disabled={node.data.isClosed && !lemmaNodesSelectable}
                selected={selected}
                class={classMap({
                    [style.nodeLemma]: node.data.isLemma === undefined ? false : node.data.isLemma,
                    [style.nodeSelectLemma]: node.data.isClosed && lemmaNodesSelectable
                })}
            />
            <text
                ref={textRef}
                text-anchor="middle"
                class={classMap({
                    [style.textSelected]: selected,
                    [style.textClosed]: node.data.isClosed && !lemmaNodesSelectable
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
