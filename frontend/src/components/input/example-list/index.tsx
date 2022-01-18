import { Fragment, h } from "preact";
import { route } from "preact-router";

import { AppStateActionType } from "../../../types/app/action";
import { Example } from "../../../types/app/example";
import { CalculusType } from "../../../types/calculus";
import { delExample } from "../../../util/admin";
import { useAppState } from "../../../util/app-state";
import DeleteIcon from "../../icons/delete";
import Btn from "../btn";

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

const ExampleList: preact.FunctionalComponent<Props> = ({
    calculus,
    className,
}) => {
    const { config, isAdmin, server, notificationHandler, onChange, dispatch, adminKey, setConfig } = useAppState();

    /**
     * Parses an example, and changes to the calculus/view
     * @param {Example} example - The example that should be used
     * @returns {void}
     */
    const useExample = async (example: Example) => {
        const exampleCalculus = example.calculus;
        const url = `${server}/${example.calculus}/parse`;

        dispatch({
            type: AppStateActionType.UPDATE_SAVED_FORMULA,
            calculus: exampleCalculus,
            value: decodeURIComponent(example.formula),
        });

        try {
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "text/plain",
                },
                method: "POST",
                body: `formula=${example.formula}&params=${example.params}`,
            });
            if (response.status !== 200) {
                notificationHandler.error(await response.text());
            } else {
                const parsed = await response.json();
                onChange(exampleCalculus, parsed);
                route(`/${exampleCalculus}/view`);
            }
        } catch (e) {
            notificationHandler.error((e as Error).message);
        }
    };

    const examples = config.examples.filter(
        (example) => example.calculus === calculus,
    );

    if (!examples.length) {
        return null;
    }

    return (
        <div class={`card  ${className}`}>
            <h3>Examples</h3>
            {config.examples.map((example, index) =>
                example.calculus === calculus ? (
                    <div
                        class={`card  ${style.example}`}
                        onClick={() => useExample(example)}
                    >
                        {example.name ? <h3>{example.name}</h3> : undefined}
                        {example.description ? (
                            <p class={style.description}>
                                {example.description}
                            </p>
                        ) : undefined}
                        <p>
                            {decodeURIComponent(example.formula)
                                .split(/\n/)
                                .join("; ")}
                        </p>
                        {isAdmin && (
                            <Fragment>
                                <p class={style.params}>{example.params}</p>
                                <Btn
                                    onClick={(e) => {
                                        e.stopImmediatePropagation();
                                        delExample(server, index, adminKey, setConfig, notificationHandler);
                                    }}
                                    label="Delete"
                                    icon={<DeleteIcon />}
                                />
                            </Fragment>
                        )}
                    </div>
                ) : undefined,
            )}
        </div>
    );
};

export default ExampleList;
