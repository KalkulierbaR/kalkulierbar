import { Fragment, h } from "preact";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus } from "../../types/app";
import UploadFAB from "../../components/btn/upload";

interface Props {}

const DPLL: preact.FunctionalComponent<Props> = () => {
    return (
        <Fragment>
            <Format foLogic={false} />
            <FormulaInput calculus={Calculus.dpll} />
            <UploadFAB calculus="dpll" />
        </Fragment>
    );
};

export default DPLL;
