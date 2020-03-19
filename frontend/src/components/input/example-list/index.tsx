import { h } from "preact";
import { CalculusType } from "../../../types/app";
import { delExample } from "../../../util/api";
import { useAppState } from "../../../util/app-state";
import Btn from "../../btn";

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

const onDelete = (index: number) => {
    const { server, onError, adminKey, setConfig } = useAppState();
    delExample(server, index, adminKey, setConfig, onError);
};

const ExampleList: preact.FunctionalComponent<Props> = ({
    calculus,
    className,
}) => {
    const { config } = useAppState();
    const examples = config.examples.filter(
        (example) => example.calculus === calculus,
    );

    if (!examples.length) {
        return null;
    }

    return (
        <div class={`card ${className}`}>
            {examples.map((example, index) => (
                <div class="card">
                    <p>{example.name}</p>
                    <p>{example.description}</p>
                    <p>{example.formula}</p>
                    <p>{example.params}</p>
                    <Btn onClick={() => onDelete(index)}>Delete</Btn>
                </div>
            ))}
        </div>
    );
};

export default ExampleList;
