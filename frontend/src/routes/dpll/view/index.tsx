import { Fragment, h } from "preact";
import DPLLTree from "../../../components/dpll/tree";
import { useAppState } from "../../../helpers/app-state";

import * as style from "./style.scss";

interface Props {}

const DPLLView: preact.FunctionalComponent<Props> = () => {
    const { dpll: state } = useAppState();

    if (!state) {
        return <p>No State!</p>;
    }

    return (
        <Fragment>
            <h2>DPLL View</h2>
            <div class={`card ${style.dpllView}`}>
                <DPLLTree nodes={state.tree} />
            </div>
        </Fragment>
    );
};

export default DPLLView;
