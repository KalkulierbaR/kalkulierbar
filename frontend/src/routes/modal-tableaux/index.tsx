import { Fragment, h } from "preact";
import { useState } from "preact/hooks";

import HintIcon, { Hint } from "../../components/hint";
import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import Switch from "../../components/input/switch";
import { ModalCalculusType } from "../../types/calculus";
import { ModalTableauxParams } from "../../types/calculus/modal-tableaux";
import { useAppState } from "../../util/app-state";

interface Props {
    /**
     * The calculus type
     */
    calculus: ModalCalculusType;
}

const ModalTableaux: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const { smallScreen } = useAppState();

    const [backtracking, setBacktracking] = useState(true);

    const Params: ModalTableauxParams = {
        backtracking,
    };
    const params = Params;

    return (
        <Fragment>
            <Format
                foLogic={false}
                allowClauses={false}
                allowSequences={false}
                modalLogic={true}
            />
            <FormulaInput
                calculus={calculus}
                placeholder={"!(<>(!a)) -> []a"}
                params={params}
            />
            <div class="card">
                <h3>Parameters</h3>
                <Hint top={smallScreen} />
                <div class="flex-container">
                    <div class="first">
                        <Switch
                            label="Backtracking"
                            onChange={setBacktracking}
                            initialState={true}
                        />
                        <HintIcon
                            hint={
                                "This allows you to undo moves during the proof." +
                                (!smallScreen ? " (Shortcut: CTRL + Z)" : "")
                            }
                        />
                    </div>
                </div>
            </div>
            <ExampleList calculus={calculus} />
        </Fragment>
    );
};

export default ModalTableaux;
