import { Fragment, h } from "preact";

import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus } from "../../types/calculus";

const NCTableaux: preact.FunctionalComponent = () => {
    return (
        <Fragment>
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

export default NCTableaux;
