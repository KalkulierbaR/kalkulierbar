import type preact from "preact";

import {
    FormulaTreeLayoutNode,
    SequentTreeLayoutNode,
} from "../../../../types/calculus/sequent";
import { LayoutItem } from "../../../../types/layout";
import { classMap } from "../../../../util/class-map";
import HorizontalList from "../../../svg/horizontal-list";

import * as style from "./style.module.scss";

interface Props {
    /**
     * The single tree node to represent
     */
    node: LayoutItem<SequentTreeLayoutNode>;
    /**
     * Boolean to change the style of the node if it is selected
     */
    selected: boolean;
    /**
     * The ListIndex of the node to represent
     */
    selectedListIndex?: string;
    /**
     * The function to select and deselect a specific formula
     */
    selectFormulaCallback: (
        formula: FormulaTreeLayoutNode,
        nodeId: number,
    ) => void;
}

const SequentTreeNode: preact.FunctionalComponent<Props> = ({
    node,
    selected,
    selectedListIndex,
    selectFormulaCallback,
}) => {
    return (
        <g>
            <rect
                className={classMap({
                    [style.active]: !node.data.isClosed,
                    [style.disabled]: node.data.isClosed,
                    [style.selected]: selected,
                    [style.unselected]: !selected && !node.data.isClosed,
                    [style.node]: !selected,
                    [style.rectSelected]: selected,
                })}
                x={node.x - node.data.width / 2}
                y={node.y - 15.5}
                width={node.data.width}
                height={20}
                rx="4"
            />
            <HorizontalList
                node={node}
                antecedent={node.data.antecedent}
                succedent={node.data.succedent}
                turnstyle={node.data.turnstyle}
                selected={selected}
                selectFormulaCallback={selectFormulaCallback}
                selectedListIndex={selectedListIndex}
            />
        </g>
    );
};

export default SequentTreeNode;
