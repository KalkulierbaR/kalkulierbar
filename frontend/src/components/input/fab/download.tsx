import { h } from "preact";
import { useMemo } from "preact/hooks";

import { CalculusType } from "../../../types/calculus";
import DownloadIcon from "../../icons/download";
import * as style from "../btn/style.scss";

import FAB from "./index";

interface Props {
    /**
     * The state to save
     */
    state: any;
    /**
     * The name of the file
     */
    name: string;
    /**
     *
     */
    type: CalculusType;
}

const DownloadFAB: preact.FunctionalComponent<Props> = ({
    state,
    name,
    type,
}) => {
    const finalJSON = useMemo(() => {
        state = { ...state, type };
        return encodeURIComponent(JSON.stringify(state));
    }, [state]);

    return (
        <a
            href={`data:text/json;charset=utf-8,${finalJSON}`}
            download={`${name}.json`}
            class={style.noUnderline}
        >
            <FAB
                icon={<DownloadIcon />}
                label="Download"
                showIconAtEnd={true}
                mini={true}
                extended={true}
            />
        </a>
    );
};

export default DownloadFAB;
