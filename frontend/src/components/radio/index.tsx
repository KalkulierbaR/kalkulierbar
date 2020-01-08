import { h } from "preact";

import InfoIcon from "../icons/info";
import * as style from "./style.scss";

interface Props {
    /**
     * The group which the radio belongs to
     */
    group: string;
    /**
     * The radio's id
     */
    id: string;
    /**
     * The radio's label
     */
    label?: string;
    /**
     * Whether the radio is selected or not
     */
    checked?: boolean;
    /**
     * The function to call, when the switch is selected
     */
    onSelect?: (e: Event) => void;
    /**
     * The radio's tooltip
     */
    hint?: string;
}

const Radio: preact.FunctionalComponent<Props> = ({
    group,
    label,
    checked = false,
    onSelect,
    id,
    hint
}) => {
    return (
        <div class={style.container}  data-rh={hint} >
            <div class="mdc-radio">
                <input
                    class="mdc-radio__native-control"
                    type="radio"
                    id={id}
                    name={group}
                    checked={checked}
                    onInput={(e: Event) => onSelect && onSelect(e)}
                />
                <div class="mdc-radio__background">
                    <div class="mdc-radio__outer-circle" />
                    <div class="mdc-radio__inner-circle" />
                </div>
                <div class="mdc-radio__ripple" />
            </div>
            <label for={id} class={style.label} >
                {label}
            </label>
            {hint ? <InfoIcon/> : ""}
        </div>
    );
};

export default Radio;
