import { Component, h } from "preact";

import ReactHintFactory from "react-hint";
import "react-hint/css/index.css";
import InfoIcon from "../icons/info";

import * as style from "./style.scss";

const ReactHint = ReactHintFactory({ createElement: h, Component });

interface HintProps {
    /**
     * Whether or not the Hint should be above the element.
     * Default `false`
     */
    top?: boolean;
    /**
     * Transforms the element to the left
     */
    pushToLeft?: boolean;
    attribute?: string;
}

export const Hint: preact.FunctionalComponent<HintProps> = ({
    top = false,
    pushToLeft = false,
    attribute
}) => (
    <ReactHint
        autoPosition={false}
        events={true}
        attribute={attribute}
        className={top && pushToLeft ? "rh-push-to-left react-hint" : undefined}
        position={top ? "top" : "right"}
    />
);

interface Props {
    hint: string;
    attribute?: string;
}

const HintIcon: preact.FunctionalComponent<Props> = ({
    hint,
    attribute = "data-rh"
}) => {
    return h("span", { class: style.hint, [attribute]: hint }, <InfoIcon />);
};

export default HintIcon;
