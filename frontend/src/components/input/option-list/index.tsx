import { h } from "preact";
import {classMap} from "../../../helpers/class-map";
import * as style from "./style.scss";

interface Props {
    /**
     * The options which shall be displayed
     */
    options: string[];
    /**
     * The selected option to have a unique background style
     */
    selectedOptionId?: number;
    /**
     * The function to call, when the user selects an option
     */
    selectOptionCallback: CallableFunction;
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
}) => {
    return (
        <div class={`card ${className}`}>
            {options.map((option, index) => (
                <p
                    onClick={() => selectOptionCallback(index)}
                    class={classMap({
                        [style.option]: true,
                        [style.optionSelected]: index === selectedOptionId,
                    })}
                >
                    {option}
                </p>
            ))}
        </div>
    );
};

export default OptionList;
