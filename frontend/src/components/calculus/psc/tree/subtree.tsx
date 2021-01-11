import { Fragment, h } from "preact";
import { PSCTreeLayoutNode } from "../../../../types/calculus/psc";
import { Tree } from "../../../../types/tree";
import * as style from "./style.scss";
import PSCTreeNode from "../node";

interface Props {
    node: Tree<PSCTreeLayoutNode>;
    selectedNodeId?: number;
    selectNodeCallback: (n: PSCTreeLayoutNode) => void;
    zoomFactor: number;
}

export const SubTree: preact.FunctionalComponent<Props> = ({
    node,
    selectNodeCallback,
    selectedNodeId,
    zoomFactor,
}) => {
    const dt = {x: 0,y: 0};
    return (
        <g transform={`translate(${dt.x} ${dt.y})`}>
            {node.children.map((c, i) => {
                const childDt = {x: 0,y: 0};
                return (
                    <Fragment key={i}>
                        <SubTree
                            node={c}
                            selectNodeCallback={selectNodeCallback}
                            selectedNodeId={selectedNodeId}
                            zoomFactor={zoomFactor}
                        />
                    </Fragment>
                );
            })}
            <PSCTreeNode
                selectNodeCallback={selectNodeCallback}
                node={node}
                selected={node.data.id === selectedNodeId}
                zoomFactor={zoomFactor}
            />
        </g>
    )
}