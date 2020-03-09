import { Fragment, h } from "preact";
import { TableauxTreeLayoutNode } from "../../../types/tableaux";
import { Tree } from "../../../types/tree";
import { DragTransform } from "../../../types/ui";
import TableauxTreeNode from "../node";

import * as style from "./style.scss";

interface Props {
    node: Tree<TableauxTreeLayoutNode>;
    selectedNodeId?: number;
    selectNodeCallback: (n: TableauxTreeLayoutNode) => void;
    lemmaNodesSelectable: boolean;
    onDrag: (id: number, dt: DragTransform) => void;
    dragTransforms: Record<number, DragTransform>;
    zoomFactor: number;
}

const SubTree: preact.FunctionalComponent<Props> = ({
    node,
    selectNodeCallback,
    selectedNodeId,
    lemmaNodesSelectable,
    dragTransforms,
    onDrag,
    zoomFactor,
}) => {
    const dt = dragTransforms[node.data.id] ?? { x: 0, y: 0 };

    return (
        <g transform={`translate(${dt.x} ${dt.y})`}>
            {node.children.map((c, i) => {
                const childDt = dragTransforms[c.data.id] ?? { x: 0, y: 0 };
                return (
                    <Fragment key={i}>
                        <line
                            class={style.link}
                            x1={node.x}
                            y1={node.y + 6}
                            x2={c.x + childDt.x}
                            y2={c.y + childDt.y - 16}
                        />
                        <SubTree
                            node={c}
                            onDrag={onDrag}
                            dragTransforms={dragTransforms}
                            selectNodeCallback={selectNodeCallback}
                            selectedNodeId={selectedNodeId}
                            lemmaNodesSelectable={lemmaNodesSelectable}
                            zoomFactor={zoomFactor}
                        />
                    </Fragment>
                );
            })}
            <TableauxTreeNode
                onDrag={onDrag}
                dragTransform={dt}
                selectNodeCallback={selectNodeCallback}
                node={node}
                selected={node.data.id === selectedNodeId}
                lemmaNodesSelectable={lemmaNodesSelectable}
                zoomFactor={zoomFactor}
            />
        </g>
    );
};

export default SubTree;
