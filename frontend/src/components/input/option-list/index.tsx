import { h } from "preact";
import {classMap} from "../../../helpers/class-map";
import * as style from "./style.scss";

interface Props {
    /**
     * The options which shall be displayed
     */
    options: Map<number, string>;
    /**
     * The selected option to have a unique background style
     */
    selectedOptionId?: number;
    /**
     * The function to call, when the user selects an option
     */
    selectOptionCallback: ((keyValuePair: [number, string]) => void);
    /**
     * Additional className for the element
     */
    className?: string;
}

const OptionList: preact.FunctionalComponent<Props> = ({
    options,
    selectedOptionId,
    selectOptionCallback,
    className
}) => (
        <div class={`card ${className}`}>
            {Array.from(options).map((keyValuePair: [number, string]) =>(
                <p
                    onClick={() => selectOptionCallback(keyValuePair)}
                    class={classMap({
                        [style.option]: true,
                        [style.optionSelected]: keyValuePair[0] === selectedOptionId,
                    })}
                >
                    {keyValuePair[1]}
                </p>
            ))}
        </div>
    );

export default OptionList;
