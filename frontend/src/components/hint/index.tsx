import { Component, h } from "preact";

import ReactHintFactory from "react-hint";
import "react-hint/css/index.css";
import InfoIcon from "../icons/info";

import * as style from "./style.scss";

const ReactHint = ReactHintFactory({ createElement: h, Component });

export const Hint: preact.FunctionalComponent = () => (
    <ReactHint autoPosition={false} events={true} position="right" />
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
