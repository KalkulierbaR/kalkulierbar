import { h } from "preact";
import { useRef } from "preact/hooks";
import { DPLLTreeLayoutNode } from "../../../types/dpll";
import { LayoutItem } from "../../../types/layout";
import Rectangle from "../../rectangle";

interface Props {
    /**
     * The single tree node to represent
     */
    node: LayoutItem<DPLLTreeLayoutNode>;
    /**
     * Boolean to change the style of the node if it is selected
     */
    selected: boolean;
    /**
     * The function to call, when the user selects this node
     */
    selectNodeCallback: (node: DPLLTreeLayoutNode) => void;
}

const DPLLNode: preact.FunctionalComponent<Props> = ({
    node,
    selected,
    selectNodeCallback,
}) => {
    const textRef = useRef<SVGTextElement>();

    return (
        <g onClick={() => selectNodeCallback(node.data)}>
            <Rectangle
                elementRef={textRef}
                disabled={false}
                selected={selected}
            />
            <text ref={textRef} text-anchor="middle" x={node.x} y={node.y}>
                {node.data.label}
            </text>
        </g>
    );
};

export default DPLLNode;
