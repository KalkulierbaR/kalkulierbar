import { h } from "preact";
import { CalculusType } from "../../../types/app";
import { delExample } from "../../../util/api";
import { useAppState } from "../../../util/app-state";
import Btn from "../../btn";
import { route } from "preact-router";

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

const onDelete = (e: Event, index: number) => {
    e.stopImmediatePropagation();
    const { server, onError, adminKey, setConfig } = useAppState();
    delExample(server, index, adminKey, setConfig, onError);
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

const useExample = async (exmpl: Example) => {
    const { server, onError, onChange, dispatch } = useAppState();
    const calculus = exmpl.calculus;
    const url = `${server}/${exmpl.calculus}/parse`;

    dispatch({
        type: AppStateActionType.UPDATE_SAVED_FORMULA,
        calculus,
        value: exmpl.formula,
    })

    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
            },
            method: "POST",
            body: `formula=${normalizeInput(
                exmpl.formula,
            )}&params=${exmpl.params}`,
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
}

const ExampleList: preact.FunctionalComponent<Props> = ({
    calculus,
    className,
}) => {
    const { config, isAdmin} = useAppState();

    return(
        <div class={`card  ${className}`}>
            {config.examples.map((exmpl, index) => (
                (exmpl.calculus === calculus) ? (
                    <div class="card" onClick={() => useExample(exmpl)}>
                        <p>{exmpl.name}</p>
                        <p>{exmpl.description}</p>
                        <p>{exmpl.formula}</p>
                        <p>{exmpl.params}</p>
                        {isAdmin ? (
                            <Btn onClick={(e) => onDelete(e, index)}>
                                Delete
                            </Btn>
                        ) : (
                            undefined
                        )}
                    </div>
                    ) : (
                        undefined
            )))}
        </div>
    );
};

export default ExampleList;
