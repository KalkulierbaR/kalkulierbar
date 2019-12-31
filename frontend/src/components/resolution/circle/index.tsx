import { Fragment, h } from "preact";

import { arc, pie, PieArcDatum } from "d3";
import { classMap } from "../../../helpers/class-map";
import { clauseToString } from "../../../helpers/clause";
import { CandidateClause, Clause } from "../../../types/clause";

import * as style from "./style.css";

interface Props {
    /**
     * The clauses
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
}

const ResolutionCircle: preact.FunctionalComponent<Props> = ({
    clauses,
    selectClauseCallback,
    selectedClauseId
}) => {
    // This gives us an array of clauses and their "slice" in the pie chart
    const arcs = pie<Clause>().value(() => 1)(clauses);

    const width = 723;
    const height = 590;

    const radius = Math.min(width, height) / 2;

    // This function generates an arc for us
    const gen = arc<PieArcDatum<Clause>>()
        .innerRadius(0.6 * radius)
        .outerRadius(0.8 * radius);

    // We calculate coordinates for our pie slices
    const coords = arcs.map(a => gen.centroid(a));

    return (
        <div class="card">
            <svg
                width="100%"
                height="100"
                style="min-height: 60vh"
                viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
            >
                <g>
                    {
                        <Fragment>
                            {coords.map((coordinates, index) => {
                                const disabled = 
                                    selectedClauseId !== undefined 
                                    && selectedClauseId !== index 
                                    && clauses[index].candidateLiterals.length === 0;
                                const selected = selectedClauseId === index;
                                return (
                                        <g
                                            key={index}
                                            onClick={() => !disabled && selectClauseCallback(index)}
                                            class={style.node}
                                            style="cursor: pointer;"
                                        >
                                            <rect
                                                class={classMap({
                                                    [style.active]: !disabled,
                                                    [style.disabled]: disabled,
                                                    [style.rectSelected]: selected,
                                                })}
                                                x={coordinates[0] - 16}
                                                y={coordinates[1] - 20}
                                                width={50}
                                                height={30}
                                                rx="4"
                                            />
                                            <text
                                                x={coordinates[0]}
                                                y={coordinates[1]}
                                                class={classMap({
                                                    [style.textClosed]: disabled,
                                                })}
                                            >
                                                {clauseToString(clauses[index])}
                                            </text>
                                        </g>
                                );

                            })}
                        </Fragment>}
                </g>
            </svg>
        </div>
    );
};

export default ResolutionCircle;
