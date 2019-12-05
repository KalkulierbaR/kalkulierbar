import { ComponentChild, h } from "preact";
import { classMap } from "../../helpers/class-map";
import * as style from "./style.css";

interface Props {
    mini?: boolean;
    disabled?: boolean;
    extended?: boolean;
    label: string;
    icon: ComponentChild;
}

const FAB: preact.FunctionalComponent<Props> = ({
    mini = false,
    disabled = false,
    extended = false,
    label,
    icon
}) => {
    const classes = classMap({
        [style.mini]: mini,
        [style.extended]: extended
    });
    return (
        <button
            class={style.fab + classes}
            disabled={disabled}
            aria-label={label}
        >
            {icon}
            {extended && <span class={style.label}>{label}</span>}
        </button>
    );
};

export default FAB;
