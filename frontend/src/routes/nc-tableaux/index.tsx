import { h, Fragment } from "preact";
import Format from "../../components/input/formula/format";
import FormulaInput from "../../components/input/formula";
import { Calculus } from "../../types/app";

const NCTableaux: preact.FunctionalComponent = () => {
    return (
        <Fragment>
            <Format foLogic />
            <FormulaInput calculus={Calculus.ncTableaux} params={null} />
        </Fragment>
    );
};

export default NCTableaux;
