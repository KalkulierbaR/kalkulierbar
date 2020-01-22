import { h } from "preact";

import { CandidateClause } from "../../../types/clause";

import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { checkClose } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import { circleLayout } from "../../../helpers/layout/resolution";
import ControlFAB from "../../control-fab";
import FAB from "../../fab";
import CenterIcon from "../../icons/center";
import CheckCircleIcon from "../../icons/check-circle";
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

    const { width, height, data } = useMemo(() => circleLayout(clauses), [
        clauses
    ]);

    return (
        <div class={`card ${style.noPad}`}>
            <Zoomable
                class={style.svg}
                width="100%"
                height="calc(100vh - 172px)"
                style="min-height: 60vh"
                viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
                preserveAspectRatio="xMidyMid meet"
            >
                {transform => (
                    <g
                        transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
                    >
                        {data.map(({ x, y }, index) => {
                            const disabled =
                                highlightSelectable &&
                                selectedClauseId !== undefined &&
                                selectedClauseId !== index &&
                                clauses[index].candidateLiterals.length === 0;
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
                    </g>
                )}
            </Zoomable>
            <ControlFAB>
                <FAB
                    mini={true}
                    extended={true}
                    label="Center"
                    showIconAtEnd={true}
                    icon={<CenterIcon />}
                    onClick={() => dispatchEvent(new CustomEvent("center"))}
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
