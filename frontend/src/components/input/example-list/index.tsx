import {CalculusType} from "../../../types/app";
import { useAppState } from "../../../util/app-state";
import {h} from "preact";
import Btn from "../../btn";
import {delExample} from "../../../util/api";

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

const onDelete = () => {
    const { server, onError, adminKey, setConfig} = useAppState();
    delExample(
        server,
        1,
        adminKey,
        setConfig,
        onError,
    )
    return undefined;
}

const ExampleList: preact.FunctionalComponent<Props> = ({
    calculus,
    className,
}) => {
    const { config } = useAppState();
    const examples = config.examples.filter(exmpl => exmpl.calculus === calculus);

    return(
        <div class={`card ${className}`}>
            {examples.map( exmpl => (
                <div class="card">
                    <p>{exmpl.name}</p>
                    <p>{exmpl.description}</p>
                    <p>{exmpl.formula}</p>
                    <p>{exmpl.params}</p>
                    <Btn onClick={onDelete}>
                        Delete
                    </Btn>
                </div>
            ))}
        </div>
    )
}

export default ExampleList;
