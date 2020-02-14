import { ComponentChild, h } from "preact";
import { useRef, useState } from "preact/hooks";

import {classMap} from "../../../helpers/class-map";
import * as style from "./style.scss";

interface Props {
    id?: string;
    label?: string;
    submitButton?: ComponentChild;
    onChange?: (value: string) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
    class?: string;
    value?: string;
    required?: boolean;
    inline?: boolean;
    autoComplete?: boolean;
    autoCorrect?: boolean;
    autoCapitalize?: boolean;
    type?: string;
}

const TextInput: preact.FunctionalComponent<Props> = ({
    id,
    label,
    onChange,
    submitButton,
    value,
    onKeyDown,
    required,
    inline = false,
    autoComplete = false,
    autoCorrect = false,
    autoCapitalize = false,
    type = "text",
    ...props
}) => {
    const input = useRef<HTMLInputElement>();

    const [text, setText] = useState(value);

    const randomId = `txt-input-${Math.random()}`;

    return (
        <div {...props}>
            <label
                for={id ? id : randomId}
                class={classMap({
                    [style.inline]: inline
                })}
                >
                {label}
            </label>
            <div
                class={classMap({
                    [style.row]: true,
                    [style.inline]: inline
                })}
                >
                <input
                    id={id ? id : randomId}
                    class={classMap({
                        [style.input]: true,
                        [style.inline]: inline
                    })}
                    ref={input}
                    value={text}
                    onInput={e => {
                        const res = (e.target as HTMLInputElement).value;
                        setText(res);
                        if (onChange) {
                            onChange(res);
                        }
                    }}
                    onKeyDown={onKeyDown}
                    required={required}
                    autocomplete={autoComplete ? "on" : "off"}
                    autocorrect={autoCorrect ? "on" : "off"}
                    autocapitalize={autoCapitalize ? undefined : "off"}
                    type={type}
                />
                {submitButton}
            </div>
        </div>
    );
};

export default TextInput;
