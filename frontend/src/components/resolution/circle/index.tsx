import { createRef, Fragment, h } from "preact";

import { arc, pie, PieArcDatum } from "d3";
import { classMap } from "../../../helpers/class-map";
import { clauseToString } from "../../../helpers/clause";
import { CandidateClause } from "../../../types/clause";

import { useEffect, useRef, useState } from "preact/hooks";
import Rectangle from "../../rectangle";
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
}

const CLAUSE_LENGTH_FACTOR = 0.1;
const CLAUSE_NUMBER_FACTOR = 0.1;

const ResolutionCircle: preact.FunctionalComponent<Props> = ({
    clauses,
    selectClauseCallback,
    selectedClauseId
}) => {
    const svg = useRef<SVGSVGElement>();
    const [dims, setDims] = useState<[number, number]>([0, 0]);

    // This gives us an array of clauses and their "slice" in the pie chart
    const arcs = pie<CandidateClause>().value(() => 1)(clauses);

    useEffect(() => {
        if (!svg.current) {
            return;
        }

        const svgDims = svg.current.getBoundingClientRect();

        const maxClauseLength = clauses.reduce((max, c) => {
            const s = clauseToString(c).length;
            return Math.max(s, max);
        }, 0);

        const f =
            CLAUSE_LENGTH_FACTOR *
            maxClauseLength *
            CLAUSE_NUMBER_FACTOR *
            clauses.length;

        setDims([svgDims.width * f, svgDims.height * f]);
    }, [clauses]);

    const [width, height] = dims;

    const radius = Math.min(width, height) / 2;

    // This function generates an arc for us
    const gen = arc<PieArcDatum<CandidateClause>>()
        .innerRadius(0.7 * radius)
        .outerRadius(0.9 * radius);

    // We calculate coordinates for our pie slices
    const coords = arcs.map(a => gen.centroid(a));

    return (
        <div class="card">
            <svg
                ref={svg}
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
                                    selectedClauseId !== undefined &&
                                    selectedClauseId !== index &&
                                    clauses[index].candidateLiterals.length ===
                                        0;
                                const selected = selectedClauseId === index;
                                const textRef = createRef<SVGTextElement>();
                                return (
                                    <g
                                        key={index}
                                        onClick={() =>
                                            !disabled &&
                                            selectClauseCallback(index)
                                        }
                                        class={
                                            disabled
                                                ? style.nodeDisabled
                                                : style.node
                                        }
                                    >
                                        <Rectangle
                                            elementRef={textRef}
                                            disabled={disabled}
                                            selected={selected}
                                        />
                                        <text
                                            x={coordinates[0]}
                                            y={coordinates[1]}
                                            text-anchor="middle"
                                            ref={textRef}
                                            class={classMap({
                                                [style.textClosed]: disabled
                                            })}
                                        >
                                            {clauseToString(clauses[index])}
                                        </text>
                                    </g>
                                );
                            })}
                        </Fragment>
                    }
                </g>
            </svg>
        </div>
    );
};

export default ResolutionCircle;
