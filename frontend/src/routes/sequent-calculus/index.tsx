import { Fragment, h } from "preact";
import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus } from "../../types/calculus";

const SequentCalculus: preact.FunctionalComponent = () => {
    
    return (
        <Fragment>
            <h2>Sequent Calculus</h2>
            <Format foLogic={true} />
            <FormulaInput
                calculus={Calculus.ncTableaux}
                params={null}
                foLogic={true}
            />
            <ExampleList calculus={Calculus.ncTableaux} />            
        </Fragment>
    );
};

export default SequentCalculus;