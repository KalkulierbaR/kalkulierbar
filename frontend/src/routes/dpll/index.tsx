import { Fragment, h } from "preact";
import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus } from "../../types/app";

interface Props {}

const DPLL: preact.FunctionalComponent<Props> = () => {
    return (
        <Fragment>
            <Format foLogic={false} />
            <FormulaInput calculus={Calculus.dpll} />
            <ExampleList calculus={Calculus.dpll}/>
        </Fragment>
    );
};

export default DPLL;
