import { h } from "preact";
import { checkClose as closeHelper } from "../../helpers/api";
import { useAppState } from "../../helpers/app-state";
import { CalculusType } from "../../types/app";
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
            <Btn onClick={checkClose}>Check</Btn>
        </div>
    );
};

export default CheckCloseBtn;
