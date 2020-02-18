import { createRef, h } from "preact";
import { classMap } from "../../../helpers/class-map";
import { clauseToString } from "../../../helpers/clause";
import { CandidateClause } from "../../../types/clause";
import Rectangle from "../../rectangle";

import * as style from "./style.scss";

interface Props {
    /**
     * Boolean to change the style of the node if it is selected
     */
    selected: boolean;
    /**
     * Boolean representing if the node is currently disabled
     */
    disabled: boolean;
    /**
     * The function to call, when the user selects this node
     */
    selectCallback: (index: number) => void;
    /**
     * Where to place the node
     */
    coordinates: [number, number];
    /**
     * Which clause should be the text of the node
     */
    clause: CandidateClause;
    /**
     * Boolean representing if the node is the newest resolvent
     */
    isNew: boolean;
}

const ResolutionNode: preact.FunctionalComponent<Props> = ({
    selected,
    disabled,
    selectCallback,
    coordinates,
    clause,
    isNew,
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
                class={isNew && !selected ? style.nodeNew : undefined}
            />
            <text
                x={coordinates[0]}
                y={coordinates[1]}
                text-anchor="middle"
                ref={textRef}
                class={classMap({
                    [style.textClosed]: disabled,
                    [style.textSelected]: selected,
                    [style.noTextHighlight]: true
                })}
            >
                {clauseToString(clause.clause)}
            </text>
        </g>
    );
};

export default ResolutionNode;
