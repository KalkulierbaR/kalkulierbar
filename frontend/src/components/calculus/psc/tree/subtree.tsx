import { Fragment, h } from "preact";
import {
    FormulaTreeLayoutNode,
    PSCTreeLayoutNode,
} from "../../../../types/calculus/psc";
import { Tree } from "../../../../types/tree";
import * as style from "./style.scss";
import PSCTreeNode from "../node";

interface Props {
    node: Tree<PSCTreeLayoutNode>;
    parent?: Tree<PSCTreeLayoutNode>;
    selectedNodeId?: number;
    selectedListIndex?: string;
    selectNodeCallback: (n: PSCTreeLayoutNode, selectValue?: boolean) => void;
    selectFormulaCallback: (f: FormulaTreeLayoutNode) => void;
    zoomFactor: number;
    ruleName: string;
}

export const SubTree: preact.FunctionalComponent<Props> = ({
    node,
    parent,
    selectNodeCallback,
    selectFormulaCallback,
    selectedNodeId,
    selectedListIndex,
    zoomFactor,
    ruleName,
}) => {
    const dt = { x: 0, y: 0 };
    return (
        <g transform={`translate(${dt.x} ${dt.y})`}>
            {node.children.map((c, i) => {
                const childDt = { x: 0, y: 0 };
                return (
                    <Fragment key={i}>
                        <SubTree
                            node={c}
                            parent={node}
                            selectNodeCallback={selectNodeCallback}
                            selectedNodeId={selectedNodeId}
                            zoomFactor={zoomFactor}
                            ruleName={ruleName}
                            selectFormulaCallback={selectFormulaCallback}
                            selectedListIndex={selectedListIndex}
                        />
                    </Fragment>
                );
            })}
            <PSCTreeNode
                selectNodeCallback={selectNodeCallback}
                node={node}
                parent={parent}
                // selectedNodeId={selectedNodeId}
                selected={node.data.id === selectedNodeId}
                zoomFactor={zoomFactor}
                ruleName={ruleName}
                selectFormulaCallback={selectFormulaCallback}
                selectedListIndex={selectedListIndex}
            />
        </g>
    );
};
