import { h } from "preact";
import { checkClose as closeHelper } from "../../helpers/api";
import {
    handleError,
    handleSuccess,
    useAppState
} from "../../helpers/app-state";
import { Calculus } from "../../types/app";
import Btn from "../btn";

interface Props {
    /**
     * The calculus type
     */
    calculus: Calculus;
}

const CheckCloseBtn: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const [{ server, [calculus]: state }, dispatch] = useAppState();
    const onError = handleError(dispatch);
    const onSuccess = handleSuccess(dispatch);
    const checkClose = () =>
        closeHelper(server, onError, onSuccess, calculus, state);
    return (
        <div class="card">
            <Btn onClick={checkClose}>Check</Btn>
        </div>
    );
};

export default CheckCloseBtn;
