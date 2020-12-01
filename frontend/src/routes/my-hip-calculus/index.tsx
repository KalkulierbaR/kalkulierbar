import { Fragment, h } from "preact";
import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";

const MyHipCalculus: preact.FunctionalComponent = () => {
    // Set the foLogic properties to true, when your calculus is for first order

    return (
        <Fragment>
            <h2>My Hip Calculus</h2>
            <Format foLogic={false} />            
        </Fragment>
    );
};

export default MyHipCalculus;