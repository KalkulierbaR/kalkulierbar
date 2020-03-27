import { h } from "preact";
import { CandidateClause } from "../../../types/clause";
import { VisualHelp } from "../../../types/resolution";

import * as style from "./style.scss";
import { gridLayout } from "../../../util/layout/grid";
import Zoomable from "../../zoomable";
import ResolutionNode from "../node";

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
}) => {
    const { width, height, data } = gridLayout(clauses.map((c) => c.clause));

    const onDrop = () => {};

    return (
        <div class={`card ${style.noPad}`}>
            <Zoomable
                class={style.svg}
                width="100%"
                height="calc(100vh - 172px)"
                style="min-height: 60vh"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidyMid meet"
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
