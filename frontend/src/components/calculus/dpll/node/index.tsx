import { useRef } from "preact/hooks";

import {
    DPLLNodeType,
    DPLLTreeLayoutNode,
} from "../../../../types/calculus/dpll";
import { LayoutItem } from "../../../../types/layout";
import { classMap } from "../../../../util/class-map";
import Rectangle from "../../../svg/rectangle";

import * as style from "./style.module.scss";

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
    const textRef = useRef<SVGTextElement>(null);

    const isAnnotation =
        node.data.type === DPLLNodeType.MODEL ||
        node.data.type === DPLLNodeType.CLOSED;

    return (
        <g class={style.node} onClick={() => selectNodeCallback(node.data)}>
            <Rectangle
                class={classMap({
                    [style.nodeAnnotated]: isAnnotation,
                    [style.nodeAnnotatedSelected]: isAnnotation && selected,
                })}
                elementRef={textRef}
                disabled={false}
                selected={selected}
            />
            <text
                class={classMap({
                    [style.text]: true,
                    [style.textSelected]: !isAnnotation && selected,
                })}
                ref={textRef}
                text-anchor="middle"
                x={node.x}
                y={node.y}
            >
                {node.data.label}
            </text>
        </g>
    );
};

export default DPLLNode;
