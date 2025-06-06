import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import { Calculus } from "../../types/calculus";

const NCTableaux: preact.FunctionalComponent<{ path: string }> = () => {
    return (
        <>
            <Format logicType={"fo"} />
            <FormulaInput
                calculus={Calculus.ncTableaux}
                params={null}
                placeholder={
                    "\\all X: !R(f(X)) & (R(f(a)) | !R(f(b))) & \\all X: R(f(X))"
                }
            />
            <ExampleList calculus={Calculus.ncTableaux} />
        </>
    );
};

export default NCTableaux;
