import { ComponentChild, h } from "preact";
import { classMap } from "../../../util/class-map";
import * as style from "./style.scss";

interface Props {
    /**
     * Modifies the FAB to be a smaller size, for use on smaller screens.
     * Defaults to `false`.
     */
    mini?: boolean;
    /**
     * Disabled the FAB.
     * Defaults to `false`
     */
    disabled?: boolean;
    /**
     * Enables the *extended* layout which includes a text label.
     * Defaults to `false`.
     */
    extended?: boolean;
    /**
     * The label to display when using the `extended` layout, and the `aria-label` attribute in all layouts.
     */
    label: string;
    /**
     * The component to use as the icon
     */
    icon: ComponentChild;
    /**
     * When in the *extended* layout, position the icon after the label, instead of before.
     * Defaults to `false`.
     */
    showIconAtEnd?: boolean;
    /**
     * The click event handler
     */
    onClick?: (e: MouseEvent) => void;
    /**
     * Handler for focus
     */
    onFocus?: (e: FocusEvent) => void;
    /**
     * Handler for blur
     */
    onBlur?: (e: FocusEvent) => void;
    /**
     * Additional className for styling
     */
    class?: string;
    /**
     * Whether or not the FAB is active
     */
    active?: boolean;
}

const FAB: preact.FunctionalComponent<Props> = ({
    mini = false,
    disabled = false,
    extended = false,
    label,
    icon,
    showIconAtEnd = false,
    onClick,
    onFocus,
    onBlur,
    class: className,
    active = false,
}) => {
    const classes = classMap({
        [style.mini]: mini,
        [style.extended]: extended,
        [style.active]: active,
    });

    const labelEl = extended ? <span class={style.label}>{label}</span> : null;

    return (
        <button
            class={style.fab + classes + " " + className}
            disabled={disabled}
            aria-label={label}
            onClick={onClick}
            onFocus={onFocus}
            onBlur={onBlur}
        >
            {showIconAtEnd && labelEl}
            {icon}
            {!showIconAtEnd && labelEl}
        </button>
    );
};

export default FAB;
