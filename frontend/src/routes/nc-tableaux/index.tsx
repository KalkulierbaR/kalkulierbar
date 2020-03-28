import { Fragment, h } from "preact";
import UploadFAB from "../../components/btn/upload";
import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus } from "../../types/app";

const NCTableaux: preact.FunctionalComponent = () => {
    return (
        <Fragment>
            <Format foLogic={true} />
            <FormulaInput
                calculus={Calculus.ncTableaux}
                params={null}
                foLogic={true}
            />
            <UploadFAB calculus={Calculus.ncTableaux} />
            <ExampleList calculus={Calculus.ncTableaux} />
        </Fragment>
    );
};

export default NCTableaux;
