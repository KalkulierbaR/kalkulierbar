import { h } from "preact";
import FAB from "../fab";
import DownloadIcon from "../icons/download";
import { useMemo } from "preact/hooks";

import * as style from "./style.scss";

interface Props {
    state: any;
    name: string;
}

const DownloadFAB: preact.FunctionalComponent<Props> = ({ state, name }) => {
    const finalJSON = useMemo(() => encodeURIComponent(JSON.stringify(state)), [
        state,
    ]);

    return (
        <a
            href={`data:text/json;charset=utf-8,${finalJSON}`}
            download={`${name}.json`}
            class={style.noUnderline}
        >
            <FAB
                icon={<DownloadIcon />}
                label="Download"
                showIconAtEnd
                mini
                extended
            />
        </a>
    );
};

export default DownloadFAB;
