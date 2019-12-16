import { h } from "preact";
import { AppState } from "../../types/app";
import { CheckClose } from "../app";
import Btn from "../btn";

interface Props {
    /**
     * The calculus type
     */
    calculus: keyof AppState;
    /**
     * The state to make a check on
     */
    state: AppState[keyof AppState];
}

const CheckCloseBtn: preact.FunctionalComponent<Props> = ({
    calculus,
    state
}) => {
    return (
        <CheckClose.Consumer>
            {checkClose => (
                <div class="card">
                    <Btn onClick={() => checkClose!(calculus, state)}>
                        Check
                    </Btn>
                </div>
            )}
        </CheckClose.Consumer>
    );
};

export default CheckCloseBtn;
