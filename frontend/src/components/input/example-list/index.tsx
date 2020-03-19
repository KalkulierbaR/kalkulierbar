import {h} from "preact";
import {CalculusType} from "../../../types/app";
import {delExample} from "../../../util/api";
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
    const { server, onError, adminKey, setConfig} = useAppState();
    delExample(
        server,
        index,
        adminKey,
        setConfig,
        onError,
    );
};

const ExampleList: preact.FunctionalComponent<Props> = ({
    calculus,
    className,
}) => {
    const { config, isAdmin} = useAppState();

    return(
        <div class={`card ${className}`}>
            {config.examples.map((exmpl, index) => (
                (exmpl.calculus === calculus) ? (
                    <div class="card">
                        <p>{exmpl.name}</p>
                        <p>{exmpl.description}</p>
                        <p>{exmpl.formula}</p>
                        <p>{exmpl.params}</p>
                        {isAdmin ? (
                            <Btn onClick={() => onDelete(index)}>
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
    )
};

export default ExampleList;
