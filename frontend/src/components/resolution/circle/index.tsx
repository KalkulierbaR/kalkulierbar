import { h } from "preact";

import { arc, pie, PieArcDatum } from "d3";
import { classMap } from "../../../helpers/class-map";
import { clauseToString } from "../../../helpers/clause";
import { Clause } from "../../../types/clause";

import * as styles from "./style.css";

interface Props {
    clauses: Clause[];
    candidates?: Clause[];
    selectClause: (idx: number) => void;
}

const ResolutionCircle: preact.FunctionalComponent<Props> = ({
    clauses,
    selectClause,
    candidates
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

    const candidateClauses = candidates === undefined ? clauses : candidates;

    return (
        <div class="card">
            <svg
                width="100%"
                height="100"
                style="min-height: 60vh"
                viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
            >
                {coords.map((c, i) => {
                    const disabled = candidateClauses[i] === undefined;
                    return (
                        <text
                            x={c[0]}
                            y={c[1]}
                            key={i}
                            class={classMap({
                                [styles.disabled]: disabled
                            })}
                            onClick={() => !disabled && selectClause(i)}
                        >
                            {clauseToString(clauses[i])}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

export default ResolutionCircle;
