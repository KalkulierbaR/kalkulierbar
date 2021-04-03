import { h } from "preact";

import { SequentNode } from "../../../types/calculus/sequent";
import { classMap } from "../../../util/class-map";
import { parseFormula, parseStringToListIndex } from "../../../util/sequent";

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
    node?: SequentNode | undefined;
    /**
     * listIndex
     */
    listIndex?: string;
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
    listIndex,
    disableOption = () => {
        return true;
    },
}) => {
    const handleClick = (keyValuePair: [number, string]) => {
        if (disableOption(keyValuePair[0])) {
            selectOptionCallback(keyValuePair);
        }
    };

    return (
        <div class={`card ${className}`}>
            {node !== undefined && listIndex !== undefined && (
                <div class={`card ${className}`}>
                    <p class={style.originList}>
                        <code class={style.formula}>
                            {parseFormula(
                                listIndex?.charAt(0) === "l"
                                    ? node.leftFormulas[
                                          parseStringToListIndex(listIndex)
                                      ]
                                    : node.rightFormulas[
                                          parseStringToListIndex(listIndex)
                                      ],
                            )}
                        </code>
                        <br />
                    </p>
                </div>
            )}
            {Array.from(options).map(
                (keyValuePair: [number, string]) =>
                    (disableOption(keyValuePair[0]) ||
                        listIndex === undefined) && (
                        <p
                            onClick={() => handleClick(keyValuePair)}
                            class={classMap({
                                [style.option]: true,
                                [style.optionSelected]: selectedOptionIds.includes(
                                    keyValuePair[0],
                                ),
                                [style.optionDisabled]:
                                    disableOption(keyValuePair[0]) === false,
                                [style.optionEnabled]:
                                    disableOption(keyValuePair[0]) === true,
                            })}
                        >
                            {keyValuePair[1]}
                        </p>
                    ),
            )}
        </div>
    );
};

export default OptionList;
