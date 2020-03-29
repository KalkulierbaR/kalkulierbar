import { ComponentChild, h } from "preact";
import * as style from "./style.scss";

interface Props {
    /**
     * The button's id
     */
    id?: string;
    /**
     * What type of button is this (submit and reset are used for forms)
     */
    type?: "button" | "submit" | "reset";
    /**
     * Handler for onClick event
     */
    onClick?: (e: Event) => void;
    /**
     * The button's name
     */
    name?: string;
    /**
     * The button's value
     */
    value?: string;
    /**
     * The button's label when used without a icon
     */
    label?: string;
    /**
     * The component to use as the icon
     */
    icon?: ComponentChild;
    /**
     * Whether to show the icon after a label
     */
    showIconAtEnd?: boolean;
    /**
     * The button's label when used with a icon
     */
    ariaLabel?: string;
    /**
     * Whether the button is disabled
     */
    disabled?: boolean;
    /**
     * Additional className for the element
     */
    className?: string;
}

const Btn: preact.FunctionalComponent<Props> = ({
    id,
    type = "button",
    onClick,
    name,
    value,
    label,
    icon,
    showIconAtEnd = false,
    ariaLabel,
    disabled = false,
    className,
}) => {
    return (
        <button
            onClick={onClick}
            id={id}
            type={type}
            name={name}
            value={value}
            aria-label={ariaLabel}
            disabled={disabled}
            class={`${style.btn} ${className}`}
        >
            {showIconAtEnd && label}
            {icon && (
                <span class={(label && style.icon) || undefined}>{icon}</span>
            )}
            {!showIconAtEnd && label}
        </button>
    );
};

export default Btn;
