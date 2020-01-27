import { ComponentChild, h } from "preact";
import { useRef, useState } from "preact/hooks";

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
}

const TextInput: preact.FunctionalComponent<Props> = ({
    id,
    label,
    onChange,
    submitButton,
    value,
    onKeyDown,
    required,
    ...props
}) => {
    const input = useRef<HTMLInputElement>();

    const [text, setText] = useState(value);

    const randomId = `txt-input-${Math.random()}`;

    return (
        <div {...props}>
            <label for={id ? id : randomId}>{label}</label>
            <div class={style.row}>
                <input
                    id={id ? id : randomId}
                    class={style.input}
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
                />
                {submitButton}
            </div>
        </div>
    );
};

export default TextInput;
