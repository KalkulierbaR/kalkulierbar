import { h } from "preact";
import { TableauxTreeLayoutNode } from "../../../types/tableaux";
import { Tree } from "../../../types/tree";
import { DragTransform } from "../../../types/ui";
import TableauxTreeNode from "../node";

interface Props {
    node: Tree<TableauxTreeLayoutNode>;
    selectedNodeId?: number;
    selectNodeCallback: (n: TableauxTreeLayoutNode) => void;
    lemmaNodesSelectable: boolean;
    onDrag: (id: number, dt: DragTransform) => void;
    dragTransforms: Record<number, DragTransform>;
}

const SubTree: preact.FunctionalComponent<Props> = ({
    node,
    selectNodeCallback,
    selectedNodeId,
    lemmaNodesSelectable,
    dragTransforms,
    onDrag,
}) => {
    const dt = dragTransforms[node.data.id] ?? { x: 0, y: 0 };

    return (
        <g transform={`translate(${dt.x} ${dt.y})`}>
            <TableauxTreeNode
                onDrag={onDrag}
                dragTransform={dt}
                selectNodeCallback={selectNodeCallback}
                node={node}
                selected={node.data.id === selectedNodeId}
                lemmaNodesSelectable={lemmaNodesSelectable}
            />
            {node.children.map((c) => (
                <SubTree
                    node={c}
                    onDrag={onDrag}
                    dragTransforms={dragTransforms}
                    selectNodeCallback={selectNodeCallback}
                    selectedNodeId={selectedNodeId}
                    lemmaNodesSelectable={lemmaNodesSelectable}
                />
            ))}
        </g>
    );
};

export default SubTree;
