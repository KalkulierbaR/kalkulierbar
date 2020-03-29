import { h } from "preact";
import { CalculusType } from "../../types/app";
import { checkClose as closeHelper } from "../../util/api";
import { useAppState } from "../../util/app-state";
import Btn from "../btn";

interface Props {
    /**
     * The calculus type
     */
    calculus: CalculusType;
}

const CheckCloseBtn: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const { server, [calculus]: state, onError, onSuccess } = useAppState();
    const checkClose = () =>
        closeHelper(server, onError, onSuccess, calculus, state);
    return (
        <div class="card">
            <Btn
                onClick={checkClose}
                label="Check"
            />
        </div>
    );
};

export default CheckCloseBtn;
