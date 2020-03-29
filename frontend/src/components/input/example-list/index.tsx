import { Fragment, h } from "preact";
import { route } from "preact-router";
import { AppStateActionType, CalculusType, Example } from "../../../types/app";
import { delExample } from "../../../util/admin";
import { useAppState } from "../../../util/app-state";
import Btn from "../../btn";
import DeleteIcon from "../../icons/delete";
import * as style from "./style.scss";

interface Props {
    /**
     * The Type of the calculus
     */
    calculus: CalculusType;
    /**
     * Additional className for the element
     */
    className?: string;
}

/**
 * Deletes an example
 * @param {Event} e - The Event that called the function
 * @param {number} index - The index of the Example that should be deleted
 * @returns {void}
 */
const onDelete = (e: Event, index: number) => {
    e.stopImmediatePropagation();
    const { server, onError, adminKey, setConfig, onSuccess } = useAppState();
    delExample(server, index, adminKey, setConfig, onError, onSuccess);
};

/**
 * Normalizes the user input. It replaces multiple newlines with just one,
 * replaces newlines by semicolon and removes whitespace
 * @param {string} input - The user input
 * @returns {string} - Normalized clause string
 */
const normalizeInput = (input: string) => {
    input = input.replace(/\n+$/, "");
    input = input.replace(/\n+/g, "\n");
    return encodeURIComponent(input);
};

/**
 * Parses an example, and changes to the calculus/view
 * @param {Example} example - The example that should be used
 * @returns {void}
 */
const useExample = async (example: Example) => {
    const { server, onError, onChange, dispatch } = useAppState();
    const calculus = example.calculus;
    const url = `${server}/${example.calculus}/parse`;

    dispatch({
        type: AppStateActionType.UPDATE_SAVED_FORMULA,
        calculus,
        value: decodeURIComponent(example.formula),
    });

    console.log(example.formula);
    console.log(normalizeInput(example.formula));

    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "POST",
            body: `formula=${(example.formula)}&params=${
                example.params
            }`,
        });
        if (response.status !== 200) {
            onError(await response.text());
        } else {
            const parsed = await response.json();
            onChange(calculus, parsed);
            route(`/${calculus}/view`);
        }
    } catch (e) {
        onError((e as Error).message);
    }
};

const ExampleList: preact.FunctionalComponent<Props> = ({
    calculus,
    className,
}) => {
    const { config, isAdmin } = useAppState();

    const examples = config.examples.filter(example => example.calculus === calculus);

    if (!examples.length) {
        return null;
    }

    return (
        <div class={`card  ${className}`}>
            <h3>Examples</h3>
            {config.examples.map((example, index) =>
                example.calculus === calculus ? (
                    <div class={`card  ${style.example}`} onClick={() => useExample(example)}>
                        {example.name ? <h3 class="">{example.name}</h3> : undefined}
                        {example.description ? <p class={style.description}>{example.description}</p> : undefined}
                        <p class="">{decodeURIComponent(example.formula).split(/\n/).join(" ; ")}</p>
                        {isAdmin &&
                            <Fragment>
                                <p class={style.params} >{example.params}</p>
                                <Btn
                                    onClick={(e) => onDelete(e, index)}
                                    label="Delete"
                                    icon={<DeleteIcon size={18} />}
                                />
                            </Fragment>
                        }
                    </div>
                ) : undefined,
            )}
        </div>
    );
};

export default ExampleList;
