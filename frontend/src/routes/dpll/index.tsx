import { Fragment, h } from "preact";

import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus } from "../../types/calculus";

interface Props {}

const DPLL: preact.FunctionalComponent<Props> = () => {
    return (
        <Fragment>
            <Format logicType={"prop"} />
            <FormulaInput
                calculus={Calculus.dpll}
                placeholder={"!a, c; a; !c"}
            />
            <ExampleList calculus={Calculus.dpll} />
        </Fragment>
    );
};

export default DPLL;
