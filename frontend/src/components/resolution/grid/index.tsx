import { h } from "preact";
import { CandidateClause } from "../../../types/clause";
import { VisualHelp } from "../../../types/resolution";
import { DragTransform } from "../../../types/ui";
import { gridLayout } from "../../../util/layout/grid";
import { normalize } from "../../../util/normalize";
import Zoomable from "../../zoomable";
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

const ResolutionGrid: preact.FunctionalComponent<Props> = ({
    clauses,
    visualHelp,
    selectedClauseId,
    selectable,
    selectClauseCallback,
    newestNode,
    semiSelected,
    shiftCandidateClause,
}) => {
    const {
        width,
        height,
        data,
        columns,
        rows,
        rowHeight,
        columnWidth,
    } = gridLayout(clauses.map((c) => c.clause));

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

        // Calculate the column of the new position
        const column = normalize(Math.floor(x / columnWidth), 0, columns - 1);

        // Calculate the row of the new position
        const row = normalize(
            Math.floor((y + rowHeight / 4) / rowHeight),
            0,
            rows - 1,
        );

        const newIndex = normalize(row * columns + column, 0, clauses.length);

        shiftCandidateClause(id, newIndex);
    };

    return (
        <div class={`card ${style.noPad}`}>
            <Zoomable
                class={style.svg}
                width="100%"
                height="calc(100vh - 172px)"
                style="min-height: 60vh"
                viewBox={`-16 0 ${width + 32} ${height}`}
                preserveAspectRatio="xMidYMid meet"
            >
                {(transform) => (
                    <g
                        transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
                    >
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

export default ResolutionGrid;
