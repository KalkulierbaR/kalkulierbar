import { Fragment, h } from "preact";

import ClauseInput from "../../components/input/clause";

interface Props {}

const Resolution: preact.FunctionalComponent<Props> = () => {
    return (
        <Fragment>
            <ClauseInput calculus="prop-resolution" />
        </Fragment>
    );
};

export default Resolution;
