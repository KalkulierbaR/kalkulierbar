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
        autoPosition={true}
        events={true}
        position={top ? "top" : "right"}
        onRenderContent={(target, content) => {
            const tbb = target.getBoundingClientRect();
            const availLeft = tbb.left;
            const availRight = document.documentElement.clientWidth - tbb.left - tbb.width;
            const availTop = Math.min(availLeft, availRight) * 2;
            const maxwidth = Math.min(Math.max(availRight, availLeft, availTop) * 0.9, 290);
            const minwidth = content && content.length > 50 ? maxwidth : 0;
            return (
            <div className={"react-hint__content"} style={`min-width:${minwidth}px; max-width: ${maxwidth}px;`}>
                {content}
            </div>
            )}
        }
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
