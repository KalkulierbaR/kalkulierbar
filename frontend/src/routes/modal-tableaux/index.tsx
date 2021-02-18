import { Fragment, h } from "preact";
import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus, ModalCalculusType } from "../../types/calculus";

interface Props{
    calculus: ModalCalculusType;
}

const ModalTableaux: preact.FunctionalComponent<Props> = ({
    calculus,
}
) => {
    return (
        <Fragment>
            <Format 
                foLogic={false}
                allowClauses={true}
                allowSequences={false}    
            />
            <FormulaInput
                calculus={calculus}
                foLogic={false}
            />
            <ExampleList calculus={calculus} />
        </Fragment>
    );
};

export default ModalTableaux;
