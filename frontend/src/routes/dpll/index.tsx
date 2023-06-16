import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus } from "../../types/calculus";

const DPLL: preact.FunctionalComponent = () => {
    return (
        <>
            <Format logicType={"prop"} />
            <FormulaInput
                calculus={Calculus.dpll}
                placeholder={"!a, c; a; !c"}
            />
            <ExampleList calculus={Calculus.dpll} />
        </>
    );
};

export default DPLL;
