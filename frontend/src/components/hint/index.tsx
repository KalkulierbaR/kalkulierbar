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
    top = false,
}) => (
    <ReactHint
        autoPosition={true}
        events={true}
        position={top ? "top" : "right"}
        onRenderContent={(target: any, content: string) => {
            // Calculate a maxWidth that still fits the screen for either top, left, or right positioning
            const tbb = target.getBoundingClientRect();
            const availLeft = tbb.left; // Space available to the left of the hint icon
            const availRight =
                document.documentElement.clientWidth - tbb.left - tbb.width; // Space available to the right of the hint icon
            const availTop = Math.min(availLeft, availRight) * 2; // Space available if using top positioning
            const maxWidth = Math.min(
                Math.max(availRight, availLeft, availTop) * 0.9,
                290,
            ); // Cap max width at 290px
            const minWidth = content && content.length > 50 ? maxWidth : 0; // Only set min width if there's enough text to fill it
            return (
                <div
                    class="react-hint__content"
                    style={`min-width:${minWidth}px; max-width: ${maxWidth}px;`}
                >
                    {content}
                </div>
            );
        }}
    />
);

interface Props {
    /**
     * The hint text to display
     */
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
