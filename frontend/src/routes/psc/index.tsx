import { Fragment, h } from "preact";
import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus } from "../../types/calculus";

interface Props{}

const PSC: preact.FunctionalComponent<Props> = () => {
    
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
            />                       
        </Fragment>
    );
};

export default PSC;