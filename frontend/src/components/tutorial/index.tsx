import { h } from "preact";

import * as style from "./style.scss";

interface Props {
    text: string;
    bottom: string;
    left: string;
}

const Tutorial: preact.FunctionalComponent<Props> = ({
    text,
    bottom,
    left,
}) => {
    return (
        <div class={`card ${style.tut}`} style={{ bottom, left }}>
            <span>{text}</span>
            <svg class={style.svg} width={24} height={24} viewBox="0 0 24 24">
                <path
                    fill="#fff"
                    d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z"
                />
            </svg>
        </div>
    );
};

export default Tutorial;
