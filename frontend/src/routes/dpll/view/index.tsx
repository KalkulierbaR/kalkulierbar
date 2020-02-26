import { Fragment, h } from "preact";
import DPLLTree from "../../../components/dpll/tree";
import { useAppState } from "../../../helpers/app-state";

import dpllExampleState from "./example";
import * as style from "./style.scss";

interface Props {}

const DPLLView: preact.FunctionalComponent<Props> = () => {
    const { dpll: cState } = useAppState();

    const state = cState || dpllExampleState;

    return (
        <Fragment>
            <h2>DPLL View</h2>
            <div class={style.dpllView}>
                <DPLLTree nodes={state.tree} />
            </div>
        </Fragment>
    );
};

export default DPLLView;
