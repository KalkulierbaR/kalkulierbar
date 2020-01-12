import { createRef, Fragment, h } from "preact";

import { event, select } from "d3-selection";
import { zoom } from "d3-zoom";
import { classMap } from "../../../helpers/class-map";
import { clauseToString } from "../../../helpers/clause";
import { CandidateClause } from "../../../types/clause";

import { useEffect, useRef, useState } from "preact/hooks";
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
    highlightSelectable: boolean;
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

    const { width, height, data } = circleLayout(clauses);

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
                                            x={x}
                                            y={y}
                                            text-anchor="middle"
                                            ref={textRef}
                                            class={classMap({
                                                [style.textClosed]: disabled,
                                                [style.textSelected]: selected
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
