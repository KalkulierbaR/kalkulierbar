import { Fragment, h } from "preact";
import {
    FormulaTreeLayoutNode,
    SequentTreeLayoutNode,
} from "../../../../types/calculus/sequent";
import { Tree } from "../../../../types/tree";
import SequentTreeNode from "../node";

interface Props {
    node: Tree<SequentTreeLayoutNode>;
    parent?: Tree<SequentTreeLayoutNode>;
    selectedNodeId?: number;
    selectedListIndex?: string;
    selectNodeCallback: (
        n: SequentTreeLayoutNode,
        selectValue?: boolean,
    ) => void;
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
            <SequentTreeNode
                selectNodeCallback={selectNodeCallback}
                node={node}
                parent={parent}
                // selectedNodeId={selectedNodeId}
                selected={node.data.id === selectedNodeId}
                selectFormulaCallback={selectFormulaCallback}
                selectedListIndex={selectedListIndex}
            />
        </g>
    );
};
