import { h } from "preact";
import { DPLLTreeNode } from "../../../types/dpll";
import { dpllTreeLayout } from "../../../util/dpll";
import Zoomable from "../../zoomable";

import { treeToLayoutItem } from "../../../util/layout/tree";
import DPLLNode from "../node";
import * as style from "./style.scss";

interface Props {
    nodes: DPLLTreeNode[];
    selectedNode: number | undefined;
    onSelect: (nr: number) => void;
}

const DPLLTree: preact.FunctionalComponent<Props> = ({
    nodes,
    selectedNode,
    onSelect,
}) => {
    const { root, height, width, links } = dpllTreeLayout(nodes);

    const data = treeToLayoutItem(root);

    return (
        <div class="card">
            <Zoomable
                class={style.svg}
                width="100%"
                height="calc(100vh - 192px)"
                style="min-height: 60vh"
                preserveAspectRatio="xMidYMid meet"
                viewBox={`0 -16 ${width} ${height}`}
            >
                {(transform) => (
                    <g
                        transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
                    >
                        {links.map((l) => (
                            <line
                                class={style.link}
                                x1={l.source[0]}
                                y1={l.source[1] + 6}
                                x2={l.target[0]}
                                y2={l.target[1] - 16}
                            />
                        ))}
                        {data.map((d) => (
                            <DPLLNode
                                node={d}
                                selected={d.data.id === selectedNode}
                                selectNodeCallback={() => onSelect(d.data.id)}
                            />
                        ))}
                    </g>
                )}
            </Zoomable>
        </div>
    );
};

export default DPLLTree;
