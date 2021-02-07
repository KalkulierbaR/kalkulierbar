import { h } from "preact";
import { PSCNode, PSCTreeLayoutNode } from "../../../types/calculus/psc";
import { LayoutItem } from "../../../types/layout";
import { classMap } from "../../../util/class-map";
import { nodeName } from "../../../util/psc";
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
    /**
     * If the current selected Node should be showed above
     */
    node?: PSCNode | undefined;
    /**
     * Function to decide if an option should be disabled
     */
    disableOption?: (option: number) => boolean;
}

const OptionList: preact.FunctionalComponent<Props> = ({
    options,
    selectedOptionIds = [],
    selectOptionCallback,
    className,
    node,
    disableOption = (option: number) => {return true},
}) => {

    const handleClick = (keyValuePair: [number, string]) => {
        if(disableOption(keyValuePair[0])){
            selectOptionCallback(keyValuePair)
        }
    }

    return (
        <div class={`card ${className}`}>
                {node !== undefined && (
                    <div class={`card ${className}`}>
                        <p class={style.originList}>
                            {"For "}
                            <code class={style.origin}>{nodeName(node)}</code>    
                        </p>
                    </div>
                )}
            {Array.from(options).map((keyValuePair: [number, string]) => (
                <p
                    onClick={() => handleClick(keyValuePair)}
                    class={classMap({
                        [style.option]: true,
                        [style.optionSelected]: selectedOptionIds.includes(
                            keyValuePair[0],
                        ),
                        [style.optionDisabled]: disableOption(keyValuePair[0]) === false,
                    })}
                >
                    {keyValuePair[1]}
                </p>
            ))}
        </div>
    );
};

export default OptionList;
