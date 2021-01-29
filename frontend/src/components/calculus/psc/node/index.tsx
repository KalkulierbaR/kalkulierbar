import { h, RefObject } from "preact";
import { useRef, useState, useEffect } from "preact/hooks";
import { FormulaTreeLayoutNode, PSCTreeLayoutNode } from "../../../../types/calculus/psc";
import { LayoutItem } from "../../../../types/layout";
import { classMap } from "../../../../util/class-map";
import Rectangle from "../../../svg/rectangle";
import SmallRec from "../../../svg/SmallRec";
import { nodeName, pscTreeLayout } from "../../../../util/psc";
import { estimateSVGTextWidth } from "../../../../util/text-width";

import * as style from "./style.scss";
import HorizontalList from "../../../svg/horizontalList";



interface Props {
    /**
     * The single tree node to represent
     */
    node: LayoutItem<PSCTreeLayoutNode>;
    
    selected: boolean;
    
    selectNodeCallback: (node:PSCTreeLayoutNode, selectValue?: boolean)=> void;

    selectedListIndex?: string;

    selectFormulaCallback: (formula: FormulaTreeLayoutNode) => void;

    zoomFactor: number;

    ruleName: string;
}

const lineUnderNode = (textRef: RefObject<SVGTextElement>, node:LayoutItem<PSCTreeLayoutNode>) => {
    if(node.data.parent !== null){
        const [dims, setDims] = useState({ x: 0, y: 0, height: 0, width: 0 });

    useEffect(() => {
        if (!textRef.current) {
            return
        }

        const box = textRef.current.getBBox();
        box.height += 8;
        box.y -= 4;
        setDims(box);
    });

        const width = dims.width;
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

const textNextToLine = (node: LayoutItem<PSCTreeLayoutNode>,ruleName: string) => {
    if(node.data.parent !== null){

    const width = estimateSVGTextWidth(nodeName(node.data));
    let text: string = "";

    if(ruleName === "notRight"){
        text="¬R";
    }else if (ruleName ==="notLeft"){
        text="¬L";
    }else if (ruleName === "andRight") {
        text = "∧R";
    }else if(ruleName === "andLeft"){
        text = "∧L";
    }else if (ruleName === "orRight") {
        text = "∨R";
    }else if (ruleName === "orLeft") {
        text = "∨L";
    }else if (ruleName === "Ax") {
        text = "Ax";
    }

    return (
        <text
            x={node.x + width + 20}
            y={node.y + 15}
        />
    )
    }
    return;
}

const PSCTreeNode: preact.FunctionalComponent<Props> = ({
    node,
    selected,
    selectedListIndex,
    selectNodeCallback,
    selectFormulaCallback,
    zoomFactor,
    ruleName,
}) => {
    const textRef = useRef<SVGTextElement>();
    
    // Uses parameter lemmaNodesSelectable to determine if the Node should be selectable
    const nodeIsClickable = !node.data.isClosed;

    /**
     * Handle the onClick event of the node
     * @returns {void}
     */
    const handleClick = () => {
        if (nodeIsClickable) {
            selectNodeCallback(node.data);
        }
    };

    if(node.data.leftFormulas.length === 0 && node.data.rightFormulas.length === 0 && node.data.isClosed ){
        return (
            <g>
                <text
                    ref={textRef}
                    class={style.trans}
                    text-anchor="middle"
                    x={node.x}
                    y={node.y}
                >
                    {
                        nodeName(node.data)
                    }
                </text>
                <g>
                    {
                         lineUnderNode(textRef,node)
                    }   
                    {      
                        textNextToLine(node, node.data.lastMove!.type.toString())
                    }
                </g>
            </g>

        )
    }

    return (
        <g
            onClick={handleClick}
        >
            <text
                    ref={textRef}
                    class={style.trans}
                    text-anchor="middle"
                    x={node.x}
                    y={node.y}
                >
                    {
                        nodeName(node.data)
                    }
                </text>
            <Rectangle
                elementRef={textRef}
                disabled={true}
                selected={selected}
                class={classMap({
                    [style.node]: !selected,
                    [style.rectSelected]: selected,})}
            />
            <g>
                
                <HorizontalList
                    textRef={textRef}
                    node={node}
                    leftFormulas={node.data.leftFormulas}
                    rightFormulas={node.data.rightFormulas}
                    selected={selected}
                    selectNodeCallback={selectNodeCallback}
                    selectFormulaCallback={selectFormulaCallback}
                    selectedListIndex={selectedListIndex}
                />
            
            {
                lineUnderNode(textRef,node)
            }
            {      
                textNextToLine(node,ruleName)
            }
            </g>
        </g>
        
    )
}

export default PSCTreeNode;

