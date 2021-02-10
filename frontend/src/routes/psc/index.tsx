import { Fragment, h } from "preact";
import { useState } from "preact/hooks";

import HintIcon, { Hint } from "../../components/hint";
import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import Switch from "../../components/input/switch";
import { Calculus, PSCCalculusType } from "../../types/calculus";
import { PSCParams } from "../../types/calculus/psc";
import { useAppState } from "../../util/app-state";

interface Props {
    calculus: PSCCalculusType;
}

const PSC: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const { smallScreen } = useAppState();

    const [showOnlyApplicableRules, setShowOnlyApplicableRules] = useState(
        false,
    );

    let params;
    const pscParams: PSCParams = {
        showOnlyApplicableRules,
    };
    params = pscParams;

    return (
        <Fragment>
            <Format foLogic={calculus === Calculus.fosc} allowClauses={false} />
            <FormulaInput
                calculus={calculus}
                params={params}
                foLogic={calculus === Calculus.fosc}
                sequentPlaceholder={true}
            />

            <div class="card">
                <h3>Parameters</h3>
                <Hint top={smallScreen} />
                <div class="flex-container">
                    <div class="first">
                        <Switch
                            label="With Help"
                            onChange={setShowOnlyApplicableRules}
                            initialState={false}
                        />
                        <HintIcon hint="Only enable rules that can be applied." />
                    </div>
                </div>
            </div>
            <ExampleList calculus={calculus} />
        </Fragment>
    );
};

export default PSC;
