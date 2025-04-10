import { useState } from "preact/hooks";

import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import Switch from "../../components/input/switch";
import { Calculus, SequentCalculusType } from "../../types/calculus";
import { SequentParams } from "../../types/calculus/sequent";

interface Props {
    /**
     * the calculus to use
     */
    calculus: SequentCalculusType;
    path: string;
}

const SequentCalculus: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const [showOnlyApplicableRules, setShowOnlyApplicableRules] =
        useState(false);

    const params: SequentParams = {
        showOnlyApplicableRules,
    };

    return (
        <>
            <Format
                logicType={
                    calculus === Calculus.foSequent
                        ? "fo-sequent"
                        : "prop-sequent"
                }
            />
            <FormulaInput
                calculus={calculus}
                params={params}
                placeholder={
                    calculus === Calculus.foSequent
                        ? "\\all X: (\\all Y: !(P(X) -> P(Y))) |- \\all X: !P(X)"
                        : "!(a -> b) |- !b"
                }
            />

            <div class="card">
                <h3>Parameters</h3>
                <div class="flex-container">
                    <div class="first">
                        <Switch
                            label="Show only applicable rules"
                            onChange={setShowOnlyApplicableRules}
                            initialState={false}
                        />
                    </div>
                </div>
            </div>
            <ExampleList calculus={calculus} />
        </>
    );
};

export default SequentCalculus;
