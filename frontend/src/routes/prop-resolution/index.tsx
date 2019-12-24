import { Fragment, h } from "preact";

import ClauseInput from "../../components/input/clause";
import { AppStateUpdater } from "../../types/app";

interface Props {
    /**
     * URL of the server
     */
    server: string;
    /**
     * The function to call, when the state associated with the calculus changed
     */
    onChange: AppStateUpdater<"prop-resolution">;
    /**
     * The function to call, when there is an error
     */
    onError: (msg: string) => void;
}

const Resolution: preact.FunctionalComponent<Props> = ({
    server,
    onChange,
    onError
}) => {

    return (
        <Fragment>
            <ClauseInput
                path="prop-resolution/"
                server={server}
                calculus="prop-resolution"
                onChange={onChange}
                onError={onError}
            />
        </Fragment>
    );
};

export default Resolution;
