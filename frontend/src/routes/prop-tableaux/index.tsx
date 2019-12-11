import { Fragment, h } from "preact";
import * as style from "./style.css";

import Switch from "../../components/switch";

import ClauseInput from "../../components/input/clause";
import Radio from "../../components/radio";
import { AppStateUpdater } from "../../types/app";

interface Props {
    /**
     * URL of the server
     */
    server: string;
    onChange: AppStateUpdater<"prop-tableaux">;
    onError: (msg: string) => void;
}

const Tableaux: preact.FunctionalComponent<Props> = ({
    server,
    onChange,
    onError
}) => {
    return (
        <Fragment>
            <ClauseInput
                path="prop-tableaux/"
                server={server}
                calculus="prop-tableaux"
                onChange={onChange}
                onError={onError}
            />
            <div class={`card ${style.form}`}>
                <Switch label="Regular" />
                <div class={style.radioGroup}>
                    <Radio group="connected" label="Unconnected" />
                    <Radio group="connected" label="Strongly Connected" />
                    <Radio group="connected" label="Weakly Connected" />
                </div>
            </div>
        </Fragment>
    );
};

export default Tableaux;
