import { ComponentChild, h } from "preact";
import { classMap } from "../../helpers/class-map";
import * as style from "./style.css";

interface Props {
    mini?: boolean;
    disabled?: boolean;
    extended?: boolean;
    label: string;
    icon: ComponentChild;
    showIconAtEnd?: boolean;
    onClick?: () => void;
}

const FAB: preact.FunctionalComponent<Props> = ({
    mini = false,
    disabled = false,
    extended = false,
    label,
    icon,
    showIconAtEnd = false,
    onClick
}) => {
    const classes = classMap({
        [style.mini]: mini,
        [style.extended]: extended
    });

    const labelEl = extended ? <span class={style.label}>{label}</span> : null;

    return (
        <button
            class={style.fab + classes}
            disabled={disabled}
            aria-label={label}
            onClick={onClick}
        >
            {showIconAtEnd && labelEl}
            {icon}
            {!showIconAtEnd && labelEl}
        </button>
    );
};

export default FAB;
