import { ComponentChild, h } from "preact";
import { useRef } from "preact/hooks";

import * as style from "./style.scss";

interface Props {
    label?: string;
    submitButton?: ComponentChild;
    onChange?: (value: string) => void;
    class?: string;
    value?: string;
}

const TextInput: preact.FunctionalComponent<Props> = ({
    label,
    onChange,
    submitButton,
    value,
    ...props
}) => {
    const input = useRef<HTMLInputElement>();

    return (
        <div {...props}>
            <label>{label}</label>
            <div class={style.row}>
                <input
                    class={style.input}
                    ref={input}
                    value={value}
                    onInput={e =>
                        onChange &&
                        onChange((e.target as HTMLInputElement).value)
                    }
                />
                {submitButton}
            </div>
        </div>
    );
};

export default TextInput;
