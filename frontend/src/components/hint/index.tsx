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
}

export const Hint: preact.FunctionalComponent<HintProps> = ({
    top = false
}) => (
    <ReactHint
        autoPosition={false}
        events={true}
        position={top ? "top" : "right"}
    />
);

interface Props {
    hint: string;
}

const HintIcon: preact.FunctionalComponent<Props> = ({ hint }) => {
    return (
        <span class={style.hint} data-rh={hint}>
            <InfoIcon />
        </span>
    );
};

export default HintIcon;
