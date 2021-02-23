import { h } from "preact";
import { useMemo } from "preact/hooks";

import { CandidateClause } from "../../../../types/calculus/clause";
import { VisualHelp } from "../../../../types/calculus/resolution";
import { DragTransform } from "../../../../types/ui";
import { circleLayout } from "../../../../util/layout/circle";
import Zoomable from "../../../svg/zoomable";
import ResolutionNode from "../node";

import * as style from "./style.scss";

interface Props {
    /**
     * The clauses to display in a circle
     */
    clauses: CandidateClause[];
    /**
     * The function to call if a clause is selected
     */
    selectClauseCallback: (idx: number) => void;
    /**
     * The id of the clause if one is selected
     */
    selectedClauseId: number | undefined;
    /**
     * Whether to help the user visually to find resolution partners
     */
    visualHelp: VisualHelp;
    /**
     * Whether to highlight the newest node
     */
    newestNode: number;
    /**
     * List of clause ids that should be selectable
     */
    selectable: number[];
    /**
     * List of clause ids who should be highlighted, but not as primary
     */
    semiSelected: number[];
    /**
     * A function to shift a clause in the clauseSet
     */
    shiftCandidateClause: (oldIdx: number, newIdx: number) => void;
}

const ResolutionCircle: preact.FunctionalComponent<Props> = ({
    clauses,
    selectClauseCallback,
    selectedClauseId,
    visualHelp,
    newestNode,
    semiSelected,
    selectable,
    shiftCandidateClause,
}) => {
    const { width, height, data, radius } = useMemo(
        () => circleLayout(clauses.map((c) => c.clause)),
        [clauses],
    );

    /**
     * Handler for the drag part of drag&drop
     * @param {number} id - the index of the clause in the circle
     * @param {DragTransform} dt - how much the clause is dragged
     * @returns {void} - nothing
     */
    const onDrop = (id: number, dt: DragTransform) => {
        const clause = data[id];

        const { x: x0, y: y0 } = clause;

        const x = x0 + dt.x;
        const y = y0 + dt.y;

        // Calculate distance to (0,0) (hypotenuse)
        const distToCenter = Math.sqrt(x * x + y * y);

        // Calculate the angle for the right half
        // (we shift by Math.Pi / 2 because we did the same in the layout)
        const alpha = Math.asin(y / distToCenter) + Math.PI / 2;

        // Calculate the angle for the whole circle
        const angle = x < 0 ? 2 * Math.PI - alpha : alpha;

        // Calculate the new index and do modulo to prevent an index > length
        const newIndex =
            Math.round((angle / (2 * Math.PI)) * clauses.length) %
            clauses.length;

        shiftCandidateClause(id, newIndex);
    };

    return (
        <div class={`card ${style.noPad}`}>
            <Zoomable
                class={style.svg}
                width="100%"
                height="calc(100vh - 172px)"
                style="min-height: 60vh"
                viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet"
            >
                {(transform) => (
                    <g
                        transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
                    >
                        <circle class={style.circle} cx="0" cy="0" r={radius} />
                        {data.map(({ x, y }, index) => {
                            const clause = clauses[index];
                            const disabled =
                                [
                                    VisualHelp.highlight,
                                    VisualHelp.rearrange,
                                ].includes(visualHelp) &&
                                selectedClauseId !== clause.index &&
                                !selectable.includes(clause.index);
                            return (
                                <ResolutionNode
                                    key={index}
                                    disabled={disabled}
                                    selected={selectedClauseId === clause.index}
                                    coordinates={[x, y]}
                                    clause={clause}
                                    indexInCircle={index}
                                    selectCallback={selectClauseCallback}
                                    isNew={clause.index === newestNode}
                                    semiSelected={semiSelected.includes(
                                        clause.index,
                                    )}
                                    zoomFactor={transform.k}
                                    onDrop={onDrop}
                                />
                            );
                        })}
                    </g>
                )}
            </Zoomable>
        </div>
    );
};

export default ResolutionCircle;
