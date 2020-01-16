import { ComponentChild, h } from "preact";
import { useRef, useState } from "preact/hooks";

import * as style from "./style.scss";

interface Props {
    label?: string;
    submitButton?: ComponentChild;
    onChange?: (value: string) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
    class?: string;
    value?: string;
}

const TextInput: preact.FunctionalComponent<Props> = ({
    label,
    onChange,
    submitButton,
    value,
    onKeyDown,
    ...props
}) => {
    const input = useRef<HTMLInputElement>();

    const [text, setText] = useState(value);

    return (
        <div {...props}>
            <label>{label}</label>
            <div class={style.row}>
                <input
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
                />
                {submitButton}
            </div>
        </div>
    );
};

export default TextInput;
