import { Fragment, h } from "preact";
import UploadFAB from "../../components/btn/upload";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus } from "../../types/calculus";

interface Props {}

const DPLL: preact.FunctionalComponent<Props> = () => {
    return (
        <Fragment>
            <Format foLogic={false} />
            <FormulaInput calculus={Calculus.dpll} foLogic={false} />
            <UploadFAB calculus="dpll" />
        </Fragment>
    );
};

export default DPLL;
