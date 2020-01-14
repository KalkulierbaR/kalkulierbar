import { Fragment, h } from "preact";

import { event, select } from "d3-selection";
import { zoom } from "d3-zoom";
import { CandidateClause } from "../../../types/clause";

import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { checkClose } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import { circleLayout } from "../../../helpers/layout/resolution";
import { Transform } from "../../../types/ui";
import ControlFAB from "../../control-fab";
import FAB from "../../fab";
import CenterIcon from "../../icons/center";
import CheckCircleIcon from "../../icons/check-circle";
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
     * Whether to highlight valid resolution partners
     */
    highlightSelectable: boolean;
    /**
     * Whether to highlight the newest node
     */
    newestNode: number;
}

const ResolutionCircle: preact.FunctionalComponent<Props> = ({
    clauses,
    selectClauseCallback,
    selectedClauseId,
    highlightSelectable,
    newestNode
}) => {
    const {
        server,
        onError,
        onSuccess,
        ["prop-resolution"]: state
    } = useAppState();
    const svg = useRef<SVGSVGElement>();
    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });

    const { width, height, data } = useMemo(() => circleLayout(clauses), [
        clauses
    ]);

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

    return (
        <div class={`card ${style.noPad}`}>
            <svg
                class={style.svg}
                ref={svg}
                width="100%"
                height="100"
                style="min-height: 60vh"
                viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
                preserveAspectRatio="xMidyMid meet"
            >
                <g
                    transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
                >
                    {
                        <Fragment>
                            {data.map(({ x, y }, index) => {
                                const disabled =
                                    highlightSelectable &&
                                    selectedClauseId !== undefined &&
                                    selectedClauseId !== index &&
                                    clauses[index].candidateLiterals.length ===
                                        0;
                                return (
                                    <ResolutionNode
                                        key={index}
                                        disabled={disabled}
                                        selected={selectedClauseId === index}
                                        coordinates={[x, y]}
                                        clause={clauses[index]}
                                        selectCallback={selectClauseCallback}
                                        isNew={index === newestNode}
                                    />
                                );
                            })}
                        </Fragment>
                    }
                </g>
            </svg>
            <ControlFAB>
                <FAB
                    mini={true}
                    extended={true}
                    label="Center"
                    showIconAtEnd={true}
                    icon={<CenterIcon />}
                    onClick={() => setTransform({ x: 0, y: 0, k: 1 })}
                />
                <FAB
                    icon={<CheckCircleIcon />}
                    label="Check"
                    mini={true}
                    extended={true}
                    showIconAtEnd={true}
                    onClick={() =>
                        checkClose(
                            server,
                            onError,
                            onSuccess,
                            "prop-resolution",
                            state
                        )
                    }
                />
            </ControlFAB>
        </div>
    );
};

export default ResolutionCircle;
