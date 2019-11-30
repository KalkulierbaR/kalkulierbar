import { h } from "preact";
// import * as style from "./style.css";

import ClauseInput from "../../components/input/clause";
import { AppStateUpdater } from "../../types/app";

interface Props {
    /**
     * URL of the server
     */
    server: string;
    onChange: AppStateUpdater<"prop-tableaux">;
}

const Tableaux: preact.FunctionalComponent<Props> = ({ server, onChange }) => {
    return (
        <ClauseInput
            path="prop-tableaux/"
            server={server}
            calculus="prop-tableaux"
            onChange={onChange}
        />
    );
};

export default Tableaux;
