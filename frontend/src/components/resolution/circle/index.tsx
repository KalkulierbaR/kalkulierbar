import {h} from "preact";
import {useMemo} from "preact/hooks";
import {circleLayout} from "../../../helpers/layout/resolution";
import {CandidateClause} from "../../../types/clause";
import {VisualHelp} from "../../../types/resolution";
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
}

const ResolutionCircle: preact.FunctionalComponent<Props> = ({
    clauses,
    selectClauseCallback,
    selectedClauseId,
    visualHelp,
    newestNode,
}) => {
    const { width, height, data } = useMemo(
        () => circleLayout(clauses.map((c) => c.clause)),
        [clauses],
    );

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
                {(transform) => (
                    <g
                        transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
                    >
                        {data.map(({ x, y }, index) => {
                            const disabled =
                                [VisualHelp.highlight, VisualHelp.rearrange].includes(visualHelp) &&
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
        </div>
    );
};

export default ResolutionCircle;
