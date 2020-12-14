import { Fragment, h } from "preact";
import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus, PropCalculusType } from "../../types/calculus";
import { route } from "preact-router";

interface Props{}

const PSC: preact.FunctionalComponent<Props> = () => {
    
    return (
        <Fragment>
            <h2>Propositional Sequent Calculus</h2>
            <Format foLogic={false} />
            <FormulaInput
                calculus={Calculus.psc}
                params={null}
                foLogic={false}
            />                     
        </Fragment>
    );
};

export default PSC;