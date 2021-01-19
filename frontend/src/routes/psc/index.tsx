import { Fragment, h } from "preact";
import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus, PropCalculusType } from "../../types/calculus";
import { route } from "preact-router";
import { useAppState } from "../../util/app-state";
import HintIcon, { Hint } from "../../components/hint";
import Radio from "../../components/input/radio";
import { PSCParams, PSCType } from "../../types/calculus/psc";
import { useState } from "preact/hooks";
import Switch from "../../components/input/switch";

interface Props{}

const PSC: preact.FunctionalComponent<Props> = () => {
    
    const {smallScreen} = useAppState();

    const [pscHelp, setPscHelp] = useState(false);

    let params;
    const pscParams: PSCParams = {
        help: pscHelp,
    };
    params = pscParams;

    return (
        <Fragment>
            <h2>Propositional Sequent Calculus</h2>
            <Format foLogic={false} 
                    allowClauses ={false}
            />
            <FormulaInput
                calculus={Calculus.psc}
                params={null}
                foLogic={false}
				propPlaceholder={true}
            />

            <div class="card">
                <h3>Parameters</h3>
                <Hint top={smallScreen}/>
                <div class="flex-container">
                    <div class="first">
                        <Switch
                            label="With Help"
                            onChange={setPscHelp}
                            initialState={false}
                        />
                        <HintIcon hint="Only enable rules that can be applied."/>

                    </div>
                </div>
            
            </div>             
                                 
        </Fragment>
    );
};

export default PSC;