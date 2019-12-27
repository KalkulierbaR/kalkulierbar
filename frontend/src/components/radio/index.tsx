import { h } from "preact";
import * as style from "./style.scss";

interface Props {
    group: string;
    id: string;
    label?: string;
    checked?: boolean;
    onSelect?: (e: Event) => void;
}

const Radio: preact.FunctionalComponent<Props> = ({
    group,
    label,
    checked = false,
    onSelect,
    id
}) => {
    return (
        <div class={style.container}>
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
            <label for={id} class={style.label}>
                {label}
            </label>
        </div>
    );
};

export default Radio;
