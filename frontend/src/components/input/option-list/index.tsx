import { h } from "preact";
import { classMap } from "../../../util/class-map";
import * as style from "./style.scss";

interface Props {
    /**
     * The options which shall be displayed
     */
    options: Map<number, string>;
    /**
     * The selected option to have a unique background style
     */
    selectedOptionIds?: number[];
    /**
     * The function to call, when the user selects an option
     */
    selectOptionCallback: (keyValuePair: [number, string]) => void;
    /**
     * Additional className for the element
     */
    className?: string;
}

const OptionList: preact.FunctionalComponent<Props> = ({
    options,
    selectedOptionIds = [],
    selectOptionCallback,
    className,
}) => {

    const handleClick = (keyValuePair: [number, string]) => {
        if( true ){
            selectOptionCallback(keyValuePair)
        }
    }

    return (
        <div class={`card ${className}`}>
            {Array.from(options).map((keyValuePair: [number, string]) => (
                <p
                    onClick={() => handleClick(keyValuePair)}
                    class={classMap({
                        [style.option]: true,
                        [style.optionSelected]: selectedOptionIds.includes(
                            keyValuePair[0],
                        ),
                    })}
                >
                    {keyValuePair[1]}
                </p>
            ))}
        </div>
    );
};

export default OptionList;
