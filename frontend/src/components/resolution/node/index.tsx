import { createRef, h } from "preact";
import { classMap } from "../../../helpers/class-map";
import { clauseToString } from "../../../helpers/clause";
import { CandidateClause } from "../../../types/clause";
import Rectangle from "../../rectangle";

import * as style from "./style.scss";

interface Props {
    selected: boolean;
    disabled: boolean;
    selectCallback: (index: number) => void;
    coordinates: [number, number];
    clause: CandidateClause;
    isNew: boolean;
}

const ResolutionNode: preact.FunctionalComponent<Props> = ({
    selected,
    disabled,
    selectCallback,
    coordinates,
    clause,
    isNew
}) => {
    const textRef = createRef<SVGTextElement>();
    return (
        <g
            onClick={() => !disabled && selectCallback(clause.index)}
            class={disabled ? style.nodeDisabled : style.node}
        >
            <Rectangle
                elementRef={textRef}
                disabled={disabled}
                selected={selected}
                class={isNew ? style.nodeNew : undefined}
            />
            <text
                x={coordinates[0]}
                y={coordinates[1]}
                text-anchor="middle"
                ref={textRef}
                class={classMap({
                    [style.textClosed]: disabled,
                    [style.textSelected]: selected
                })}
            >
                {clauseToString(clause)}
            </text>
        </g>
    );
};

export default ResolutionNode;
