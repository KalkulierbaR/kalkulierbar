import { ComponentChild } from "preact";
import { useRef, useState } from "preact/hooks";

import { classMap } from "../../../util/class-map";

import * as style from "./style.module.scss";

interface Props {
    /**
     * Id for the input
     */
    id?: string;
    /**
     * Label to display
     */
    label?: string;
    /**
     * A submit button to render
     */
    submitButton?: ComponentChild;
    /**
     * Handler for changes of the input value
     */
    onChange?: (value: string) => void;
    /**
     * Handler for key event
     */
    onKeyDown?: (event: KeyboardEvent) => void;
    /**
     * Handler for focus event
     */
    onFocus?: (event: FocusEvent) => void;
    /**
     * Handler for blur event
     */
    onBlur?: (event: FocusEvent) => void;
    /**
     * Additional classes for styling
     */
    class?: string;
    /**
     * The default start value of the input
     */
    startValue?: string;
    /**
     * This value is synced with the input (overwrites startValue)
     */
    syncValue?: string;
    /**
     * Whether the input is required for the HTML form
     */
    required?: boolean;
    /**
     * Whether to display the label inline.
     * Default: `false`
     */
    inline?: boolean;
    /**
     * Whether to use autocomplete.
     * Default: `false`
     */
    autoComplete?: boolean;
    /**
     * Whether to use autocorrect.
     * Default: `false`
     */
    autoCorrect?: boolean;
    /**
     * Whether to auto capitalize the first word.
     * Default: `false`
     */
    autoCapitalize?: boolean;
    /**
     * The type of the input.
     * Default: `"text"`
     */
    type?: string;
    /**
     * Whether to automatically apply focus
     * Default: `false`
     */
    autoFocus?: boolean;
    /**
     * Whether to enable spellcheck.
     * Default: `false`
     */
    spellcheck?: boolean;
}

const TextInput: preact.FunctionalComponent<Props> = ({
    id,
    label,
    onChange,
    submitButton,
    startValue,
    syncValue,
    onKeyDown,
    onFocus,
    onBlur,
    required,
    inline = false,
    autoComplete = false,
    autoCorrect = false,
    autoCapitalize = false,
    type = "text",
    autoFocus = false,
    spellcheck = false,
    ...props
}) => {
    const input = useRef<HTMLInputElement>(null);

    const [text, setText] = useState(startValue);

    const randomId = `txt-input-${Math.random()}`;

    return (
        <div {...props}>
            <label
                for={id ? id : randomId}
                class={classMap({
                    [style.inline]: inline,
                })}
            >
                {label}
            </label>
            <div
                class={classMap({
                    [style.row]: true,
                    [style.inline]: inline,
                })}
            >
                <input
                    id={id ? id : randomId}
                    class={classMap({
                        [style.input]: true,
                        [style.inline]: inline,
                    })}
                    ref={input}
                    value={syncValue !== undefined ? syncValue : text}
                    onInput={(e) => {
                        const res = (e.target as HTMLInputElement).value;
                        setText(res);
                        if (onChange) {
                            onChange(res);
                        }
                    }}
                    onKeyDown={onKeyDown}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    required={required}
                    autocomplete={autoComplete ? "on" : "nope"}
                    autocorrect={autoCorrect ? "on" : "off"}
                    autocapitalize={autoCapitalize ? undefined : "off"}
                    type={type}
                    autofocus={autoFocus ? true : undefined}
                    spellcheck={spellcheck}
                />
                {submitButton}
            </div>
        </div>
    );
};

export default TextInput;
