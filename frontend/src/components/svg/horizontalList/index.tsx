import { h, RefObject } from "preact";
import { FormulaNode, FormulaTreeLayoutNode, PSCNode } from "../../../types/calculus/psc";
import { useEffect, useState ,useRef} from "preact/hooks";
import { estimateSVGTextWidth } from "../../../util/text-width";
import { nodeName, formulaNames, parseFormula } from "../../../util/psc";
import SmallRec from "../SmallRec";
import { PSCTreeLayoutNode } from "../../../types/calculus/psc";
import { LayoutItem } from "../../../types/layout";
import * as style from "./style.scss";
import FormulaTreeNode from "../../calculus/psc/formulaNode";

interface Props
 {
    textRef: RefObject<SVGTextElement>;
    /**
     * The Formulars to put in the left side
     */
    leftFormulars: FormulaNode[];
    /**
     * The Formulars to put in the right side
     */
    rightFormulars: FormulaNode[];
    /**
     * The Node the list will be inside
     */
    node: LayoutItem<PSCTreeLayoutNode>;
    /**
     * Boolean to change the style of the node if it is selected
     */
    selected: boolean;
    /**
     * The Callback if the Formula got selected
     */
    selectFormulaCallback: (formula: FormulaTreeLayoutNode) => void;
    /**
     * Index of the selected Formula
     */
    selectedListIndex?: string;
    /**
     * The Callback if the Node got selected
     */
    selectNodeCallback: (node: PSCTreeLayoutNode, selectValue?: boolean) => void;
    
}

const NODE_SPACING = 4;
const SEPERATOR_SPACING = 12;
const RECTANGLE_PUFFER = 4;
const NODE_PUFFER = 16;

/**
 * Draws a Comma at the given coordinates 
 * @param x the x coordinate on which the comma is drawn
 * @param y the y coordinate on which the comma is drawn
 */
const drawComma = (x: number, y: number) => {
    return (
        <text
            class={style.textSelected}
            text-anchor="left"
            x={x}
            y={y}
        >,
        </text>
    )
}
/**
 * Draws the Formula for the given parameters
 * @param formula the FormulaNode which will be drawn by the method
 * @param node the big node in which the formula is drawn
 * @param selected the parameter which tell if the current node is selected or not 
 * @param xCoord the x coordinate in which the Formula is drawn
 */
const drawFormula = (
    formula: FormulaTreeLayoutNode, 
    node: LayoutItem<PSCTreeLayoutNode>, 
    selectedListIndex: string | undefined, 
    xCoord: number, 
    selectFormulaCallback: (formula: FormulaTreeLayoutNode) => void,
    selectNodeCallback: (node: PSCTreeLayoutNode) => void,
    selected: boolean,
    left: boolean,
) => {
    return (
        <FormulaTreeNode
            formula={formula}
            node={node}
            xCord={xCoord + (estimateSVGTextWidth(parseFormula(formula)) + RECTANGLE_PUFFER) / 2}
            selectedListIndex={selectedListIndex}
            selectFormulaCallback={selectFormulaCallback}
            selectNodeCallback={selectNodeCallback}
            selected={selected}
            left={left}
        />
    )
}

/**
 * Draws the Seperator between the right and left Formulas 
 * @param x the x coordinate on which the seperator is drawn
 * @param y the y coordinate on which the seperator is drawn
 */
const drawSeperator = (x: number, y: number) => {
    return (
        <text
                class={style.textSelected}
                text-anchor="left"
                x={x}
                y={y}
            >
                ⊢
            </text>
    )
}

/**
 * Creates an array which contains the htmlCode for the given Sequence. (formulas, commas and the sequenceSeperator)
 * @param leftFormulas the formulas on the left hand side of the sequence
 * @param rightFormulas the formulas on the right hand side of the sequence
 * @param node the overlaying node in which the sequence is to be drawn
 * @param selected I dont know what this is for..........................................................................................................................................
 */
const getSequence = (
    leftFormulas: FormulaNode[],
    rightFormulas: FormulaNode[],
    node: LayoutItem<PSCTreeLayoutNode>,
    selectedListIndex: string | undefined,
    dimsX: number,
    selectFormulaCallback: (formula: FormulaTreeLayoutNode) => void,
    selectNodeCallback: (node: PSCTreeLayoutNode) => void,
    selected: boolean,
) => {
    let totalSize = 0;
    leftFormulas.forEach((elem, index) => {
        totalSize += estimateSVGTextWidth(parseFormula(elem) + RECTANGLE_PUFFER);
        if(index < leftFormulas.length - 1){
            totalSize += NODE_SPACING;
        }
    })

    totalSize += SEPERATOR_SPACING;

    rightFormulas.forEach((elem, index) => {
        totalSize += estimateSVGTextWidth(parseFormula(elem) + RECTANGLE_PUFFER);
        if(index < rightFormulas.length - 1){
            totalSize += NODE_SPACING;
        }
    })

    totalSize = dimsX + NODE_PUFFER / 2;

    let htmlArray: any[] = [];
        leftFormulas.forEach((elem, index) => {
        let formulaLayoutNode: FormulaTreeLayoutNode = {...elem, id: "l" + index.toString()};
        htmlArray.push(drawFormula(formulaLayoutNode, node, selectedListIndex, totalSize, selectFormulaCallback, selectNodeCallback,selected,true))
        totalSize += estimateSVGTextWidth(parseFormula(elem)) + RECTANGLE_PUFFER;
        if(index < leftFormulas.length - 1){
            htmlArray.push(drawComma(totalSize, node.y));
            totalSize += NODE_SPACING;
        }
        
    })
    
    htmlArray.push(drawSeperator(totalSize, node.y));
    totalSize += SEPERATOR_SPACING;
    
    rightFormulas.forEach((elem, index) => {
        let formulaLayoutNode: FormulaTreeLayoutNode = {...elem, id: "r" + index.toString()};
        htmlArray.push(drawFormula(formulaLayoutNode, node, selectedListIndex, totalSize, selectFormulaCallback, selectNodeCallback,selected,false))
        totalSize += estimateSVGTextWidth(parseFormula(elem)) + RECTANGLE_PUFFER;
        if(index < rightFormulas.length - 1){
            htmlArray.push(drawComma(totalSize, node.y));
            totalSize += NODE_SPACING;
        }
        
    })

    return htmlArray;
}

const formulaWidth = (formulas : FormulaNode[]) => {
    let totalSize = 0;
    formulas.forEach(elem => {
        let elemSize = estimateSVGTextWidth(parseFormula(elem)) + NODE_SPACING;        
        totalSize += elemSize;
    })
    return totalSize;
}

//const drawNodes = (formulas: FormulaNode[], writePos : number) => { 
//    if(formulas.length == 0)
//        return;
//    FormulaNode()
//        return(
//            <g>
//            <FormulaTreeNode
//                formula={el.formula}
//                node={node}
//                xCord={el.xCoord}
//                selected={selected}
//            />
//            drawNode(formulas);
//            </g>
//        );
//}

const horizontalList: preact.FunctionalComponent<Props> = ({
    textRef,
    leftFormulars,
    rightFormulars,
    node,
    selected,
    selectFormulaCallback,
    selectedListIndex,
    selectNodeCallback
}) => {

    

    const [dims,setDims] = useState({x:0,y:0,height:0, width:0});

    useEffect(() =>{
        if (!textRef.current) {
            return;
        }

        const box = textRef.current.getBBox();
        box.width += 16;
        box.x -= 8;
        box.height += 8;
        box.y -= 4;
        setDims(box);
    });

    return (
        <g>
            
            {
                getSequence(leftFormulars, rightFormulars, node, selectedListIndex, dims.x,selectFormulaCallback,selectNodeCallback,selected).map((el) => (
                    el
                ))

                // extendNodesWithXCoords(leftFormulars).map((el, index) => (
                //     <g>
                //         <FormulaTreeNode
                //             formula={el.formula}
                //             node={node}
                //             xCord={el.xCoord + dims.x}
                //             selected={selected}
                //         />
                //     </g>
                // ))
                // leftFormulars.map((el,index) => (
                //     <g>
                //         <FormulaTreeNode
                //             formula={el}
                //             node={node}
                //             xCord={sizeToIndex(index,leftFormulars,rightFormulars,estimatedWidth,dims.x,true) - (medianXCord - dims.x - dims.width/2)}
                //             selected={selected}
                //         />
                //         {
                //             drawCommaIfNeeded(index,leftFormulars,sizeToIndex(index,leftFormulars,rightFormulars,estimatedWidth,dims.x,true) - (medianXCord - dims.x - dims.width/2),node.y)
                //         }
                        
                //     </g>
                // ))
            }
            
            {
                /*
                drawSep(leftFormulars,rightFormulars,sizeToIndex(leftFormulars.length - 1,leftFormulars,rightFormulars,estimatedWidth,dims.x,true)- (medianXCord - dims.x - dims.width/2),node.y)
                */
            }
            {
                /*
                rightFormulars.map((el,index) => (
                    <g>
                        <FormulaTreeNode
                            formula={el}
                            node={node}
                            xCord={sizeToIndex(index,leftFormulars,rightFormulars,estimatedWidth,dims.x,false) - (medianXCord - dims.x - dims.width/2)}
                            selected={selected}
                        />
                        {
                            drawCommaIfNeeded(index,rightFormulars,sizeToIndex(index,leftFormulars,rightFormulars,estimatedWidth,dims.x,false) - (medianXCord - dims.x - dims.width/2),node.y)
                        } 
                    </g>
                ))
                */
            }
        </g>
    );
};

export default horizontalList;