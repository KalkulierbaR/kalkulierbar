import { h } from "preact";
import { useAppState } from "../../../util/app-state";
import exampleState from "./example";

const NCTableauxView: preact.FunctionalComponent = () => {
    const { "nc-tableaux": cState, onChange } = useAppState();

    let state = cState;

    if (!state) {
        state = exampleState;
        onChange("nc-tableaux", state);
    }

    return <div></div>;
};

export default NCTableauxView;
