import { h } from "preact";
import { useRef } from "preact/hooks";
import { PSCTreeLayoutNode } from "../../../../types/calculus/psc";
import { LayoutItem } from "../../../../types/layout";
import { classMap } from "../../../../util/class-map";
import Rectangle from "../../../svg/rectangle";
import { nodeName, pscTreeLayout } from "../../../../util/psc";
import { estimateSVGTextWidth } from "../../../../util/text-width";

import * as style from "./style.scss";



interface Props {
    /**
     * The single tree node to represent
     */
    node: LayoutItem<PSCTreeLayoutNode>;
    
    selected: boolean;
    
    selectNodeCallback: (node:PSCTreeLayoutNode)=> void;

    zoomFactor: number;
}

const lineUnderNode = (node: LayoutItem<PSCTreeLayoutNode>) => {
    if(node.data.parent !== null){

        const width = estimateSVGTextWidth(nodeName(node.data));

        return (
            <line
                class={style.link}
                x1={node.x - width}
                y1={node.y + 15}
                x2={node.x + width}
                y2={node.y + 15}
            />   
        )
    }
    return;
}

const PSCTreeNode: preact.FunctionalComponent<Props> = ({
    node,
    selected,
    selectNodeCallback,
    zoomFactor,
}) => {
    const textRef = useRef<SVGTextElement>();
    
    // Uses parameter lemmaNodesSelectable to determine if the Node should be selectable
    const nodeIsClickable = true;

    /**
     * Handle the onClick event of the node
     * @returns {void}
     */
    const handleClick = () => {
        if (nodeIsClickable) {
            selectNodeCallback(node.data);
        }
    };

    return (
        <g
            onClick={handleClick}
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
                    [style.textClosed]: node.data.isClosed,
                })}
                x={node.x}
                y={node.y}
            >
                {nodeName(node.data)}
            </text>
            {
                lineUnderNode(node)
            }
            
        </g>
    )
}

export default PSCTreeNode;

