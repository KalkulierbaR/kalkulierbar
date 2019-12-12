import { h } from "preact";
import { AppState } from "../../types/app";
import { CheckClose } from "../app";
import Btn from "../btn";

interface Props {
    calculus: keyof AppState;
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
