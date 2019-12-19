import { Fragment, h } from "preact";
import * as style from "./style.css";

import Switch from "../../components/switch";

import { useState } from "preact/hooks";
import ClauseInput from "../../components/input/clause";
import Radio from "../../components/radio";
import { AppStateUpdater } from "../../types/app";
import { TableauxParams, TableauxType } from "../../types/tableaux";

interface Props {
    /**
     * URL of the server
     */
    server: string;
    /**
     * The function to call, when the state associated with the calculus changed
     */
    onChange: AppStateUpdater<"prop-tableaux">;
    /**
     * The function to call, when there is an error
     */
    onError: (msg: string) => void;
}

const Tableaux: preact.FunctionalComponent<Props> = ({
    server,
    onChange,
    onError
}) => {
    const [tabType, setTabType] = useState(TableauxType.unconnected);
    const [regular, setRegular] = useState(false);

    /**
     * Handle the selection of a TableauxType
     * @param {Event} e - The event to handle
     * @returns {void}
     */
    const handleSelect = (e: Event) => {
        const target = e.target as HTMLInputElement;

        setTabType(target.id as TableauxType);
    };

    const params: TableauxParams = { type: tabType, regular };

    return (
        <Fragment>
            <ClauseInput
                path="prop-tableaux/"
                server={server}
                calculus="prop-tableaux"
                onChange={onChange}
                onError={onError}
                params={params}
            />
            <div class="card">
                <h3>Parameters</h3>
                <div class={style.form}>
                    <Switch label="Regular" onChange={setRegular} />
                    <div class={style.radioGroup}>
                        <Radio
                            id={TableauxType.unconnected}
                            group="connected"
                            label="Unconnected"
                            checked={tabType === TableauxType.unconnected}
                            onSelect={handleSelect}
                        />
                        <Radio
                            id={TableauxType.strong}
                            group="connected"
                            label="Strongly Connected"
                            checked={tabType === TableauxType.strong}
                            onSelect={handleSelect}
                        />
                        <Radio
                            id={TableauxType.weak}
                            group="connected"
                            label="Weakly Connected"
                            checked={tabType === TableauxType.weak}
                            onSelect={handleSelect}
                        />
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Tableaux;
