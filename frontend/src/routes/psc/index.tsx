import { Fragment, h } from "preact";
import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus, PropCalculusType, PSCCalculusType } from "../../types/calculus";
import { route } from "preact-router";
import { useAppState } from "../../util/app-state";
import HintIcon, { Hint } from "../../components/hint";
import Radio from "../../components/input/radio";
import { PSCParams, PSCType } from "../../types/calculus/psc";
import { useState } from "preact/hooks";
import Switch from "../../components/input/switch";

interface Props{
    calculus: PSCCalculusType;
}

const PSC: preact.FunctionalComponent<Props> = ({calculus}) => {
    
    const {smallScreen} = useAppState();

    const [pscHelp, setPscHelp] = useState(false);

    let params;
    const pscParams: PSCParams = {
        help: pscHelp,
    };
    params = pscParams;

    return (
        <Fragment>
            <Format foLogic={calculus === Calculus.fosc} 
                    allowClauses ={false}
            />
            <FormulaInput
                calculus={Calculus.psc}
                params={null}
                foLogic={calculus === Calculus.fosc}
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