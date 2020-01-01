import {createRef, Fragment, h} from "preact";

import { arc, pie, PieArcDatum } from "d3";
import { classMap } from "../../../helpers/class-map";
import { clauseToString } from "../../../helpers/clause";
import { CandidateClause, Clause } from "../../../types/clause";

import Rectangle from "./rectangle";
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
                                const textRef = createRef<SVGTextElement>();
                                return (
                                        <g
                                            key={index}
                                            onClick={() => !disabled && selectClauseCallback(index)}
                                            class={disabled ? style.nodeDisabled : style.node}
                                        >
                                            <Rectangle
                                                textRef={textRef}
                                                disabled={disabled}
                                                selected={selected}
                                            />
                                            <text
                                                x={coordinates[0]}
                                                y={coordinates[1]}
                                                ref={textRef}
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
