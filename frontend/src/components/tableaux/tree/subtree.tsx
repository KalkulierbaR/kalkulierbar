import { h } from "preact";
import { TableauxTreeLayoutNode } from "../../../types/tableaux";
import { Tree } from "../../../types/tree";
import TableauxTreeNode from "../node";

interface Props {
    node: Tree<TableauxTreeLayoutNode>;
    selectedNodeId?: number;
    selectNodeCallback: (n: TableauxTreeLayoutNode) => void;
    lemmaNodesSelectable: boolean;
}

const SubTree: preact.FunctionalComponent<Props> = ({
    node,
    selectNodeCallback,
    selectedNodeId,
    lemmaNodesSelectable,
}) => {
    return (
        <g>
            <TableauxTreeNode
                selectNodeCallback={selectNodeCallback}
                node={node}
                selected={node.data.id === selectedNodeId}
                lemmaNodesSelectable={lemmaNodesSelectable}
            />
            {node.children.map((c) => (
                <SubTree
                    node={c}
                    selectNodeCallback={selectNodeCallback}
                    selectedNodeId={selectedNodeId}
                    lemmaNodesSelectable={lemmaNodesSelectable}
                />
            ))}
        </g>
    );
};

export default SubTree;
