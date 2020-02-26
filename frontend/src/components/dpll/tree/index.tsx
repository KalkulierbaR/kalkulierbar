import { h } from "preact";
import { dpllTreeLayout } from "../../../helpers/dpll";
import { DPLLTreeNode } from "../../../types/dpll";
import Zoomable from "../../zoomable";

import DPLLNode from "../node";
import * as style from "./style.scss";

interface Props {
    nodes: DPLLTreeNode[];
}

const DPLLTree: preact.FunctionalComponent<Props> = ({ nodes }) => {
    const { data, height, width, links } = dpllTreeLayout(nodes);

    return (
        <div class="card">
            <Zoomable
                class={style.svg}
                width="100%"
                height="calc(100vh - 192px)"
                style="min-height: 60vh"
                preserveAspectRatio="xMidyMid meet"
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
                                selected={false}
                                selectNodeCallback={() => {}}
                            />
                        ))}
                    </g>
                )}
            </Zoomable>
        </div>
    );
};

export default DPLLTree;
