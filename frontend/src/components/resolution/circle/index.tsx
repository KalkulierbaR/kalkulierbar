import { Fragment, h } from "preact";

import { arc, event, pie, PieArcDatum, select, zoom } from "d3";
import { clauseToString } from "../../../helpers/clause";
import { CandidateClause } from "../../../types/clause";

import { useEffect, useRef, useState } from "preact/hooks";
import { Transform } from "../../../types/ui";
import FAB from "../../fab";
import CenterIcon from "../../icons/center";
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
    highlightSelectable: boolean;
    newestNode: number;
}

const CLAUSE_LENGTH_FACTOR = 0.1;
const CLAUSE_NUMBER_FACTOR = 0.1;

const ResolutionCircle: preact.FunctionalComponent<Props> = ({
    clauses,
    selectClauseCallback,
    selectedClauseId,
    highlightSelectable,
    newestNode
}) => {
    const svg = useRef<SVGSVGElement>();
    const [dims, setDims] = useState<[number, number]>([0, 0]);
    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });

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

        setDims([
            Math.max(svgDims.width * f, 200),
            Math.max(svgDims.height * f, 200)
        ]);
    }, [clauses]);

    useEffect(() => {
        const d3SVG = select(`.${style.svg}`);
        d3SVG.call(
            zoom().on("zoom", () => {
                const { x, y, k } = event.transform as Transform;
                setTransform({ x, y, k });
            }) as any
        );
    });

    if (svg.current) {
        const e = svg.current as any;
        const t = e.__zoom;
        t.x = transform.x;
        t.y = transform.y;
        t.k = transform.k;
    }

    const [width, height] = dims;

    const radius = Math.min(width, height) / 2;

    // This function generates an arc for us
    const gen = arc<PieArcDatum<CandidateClause>>()
        .innerRadius(0.7 * radius)
        .outerRadius(0.9 * radius);

    // We calculate coordinates for our pie slices
    const coords = arcs.map(a => ({
        data: a.data,
        coords: gen.centroid(a)
    }));

    return (
        <div class="card">
            <svg
                class={style.svg}
                ref={svg}
                width="100%"
                height="100"
                style="min-height: 60vh"
                viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
            >
                <g
                    transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
                >
                    {
                        <Fragment>
                            {coords.map(node => {
                                const disabled =
                                    highlightSelectable &&
                                    selectedClauseId !== undefined &&
                                    selectedClauseId !== node.data.index &&
                                    node.data.candidateLiterals.length === 0;

                                return (
                                    <ResolutionNode
                                        key={node.data.index}
                                        disabled={disabled}
                                        selected={
                                            selectedClauseId === node.data.index
                                        }
                                        coordinates={node.coords}
                                        clause={node.data}
                                        selectCallback={selectClauseCallback}
                                        isNew={node.data.index === newestNode}
                                    />
                                );
                            })}
                        </Fragment>
                    }
                </g>
            </svg>
            {(transform.x !== 0 || (transform.y && 0) || transform.k !== 1) && (
                <FAB
                    class={style.fab}
                    label="center"
                    icon={<CenterIcon />}
                    onClick={() => setTransform({ x: 0, y: 0, k: 1 })}
                />
            )}
        </div>
    );
};

export default ResolutionCircle;
