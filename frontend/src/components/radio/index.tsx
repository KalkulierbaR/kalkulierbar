import { h } from "preact";
import * as style from "./style.css";

import "@material/radio/dist/mdc.radio.css";

interface Props {
    group: string;
    label?: string;
}

const Radio: preact.FunctionalComponent<Props> = ({ group, label }) => {
    const id = `r-${Math.random()}`;
    return (
        <div class={style.container}>
            <div class="mdc-radio">
                <input
                    class="mdc-radio__native-control"
                    type="radio"
                    id={id}
                    name={group}
                />
                <div class="mdc-radio__background">
                    <div class="mdc-radio__outer-circle" />
                    <div class="mdc-radio__inner-circle" />
                </div>
                <div class="mdc-radio__ripple" />
            </div>
            <label for={id} class={style.label}>
                {label}
            </label>
        </div>
    );
};

export default Radio;
