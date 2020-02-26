import { Fragment, h } from "preact";
import DPLLTree from "../../../components/dpll/tree";
import { useAppState } from "../../../helpers/app-state";

import { useCallback, useState } from "preact/hooks";
import ControlFAB from "../../../components/control-fab";
import FAB from "../../../components/fab";
import SwitchIcon from "../../../components/icons/switch";
import { classMap } from "../../../helpers/class-map";
import { clauseToString } from "../../../helpers/clause";
import dpllExampleState from "./example";
import * as style from "./style.scss";

interface Props {}

const DPLLView: preact.FunctionalComponent<Props> = () => {
    const { dpll: cState } = useAppState();

    const [showTree, setShowTree] = useState(false);

    const toggleShowTree = useCallback(() => setShowTree(!showTree), [
        showTree,
    ]);

    const state = cState || dpllExampleState;

    return (
        <Fragment>
            <h2>DPLL View</h2>
            <div
                class={classMap({
                    [style.dpllView]: true,
                    [style.showTree]: showTree,
                })}
            >
                <div class={style.list}>
                    <div class="card">
                        {state.clauseSet.clauses.map((c) => (
                            <p>{clauseToString(c)}</p>
                        ))}
                    </div>
                </div>
                <div class={style.tree}>
                    <DPLLTree nodes={state.tree} />
                </div>
            </div>
            <ControlFAB>
                <FAB
                    label="Switch"
                    icon={<SwitchIcon />}
                    mini={true}
                    extended={true}
                    onClick={toggleShowTree}
                />
            </ControlFAB>
        </Fragment>
    );
};

export default DPLLView;
