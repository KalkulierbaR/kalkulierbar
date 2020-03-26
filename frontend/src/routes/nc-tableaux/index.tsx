import { Fragment, h } from "preact";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus } from "../../types/app";

const NCTableaux: preact.FunctionalComponent = () => {
    return (
        <Fragment>
            <Format foLogic={true} />
            <FormulaInput calculus={Calculus.ncTableaux} params={null} />
        </Fragment>
    );
};

export default NCTableaux;
