import { useMemo } from "preact/hooks";

import { CalculusType } from "../../../types/calculus";
import DownloadIcon from "../../icons/download";
import * as style from "../btn/style.module.scss";

import FAB from "./index";
import {
    FOTableauxState,
    PropTableauxState,
} from "../../../types/calculus/tableaux";
import {
    FOResolutionState,
    PropResolutionState,
} from "../../../types/calculus/resolution";
import { NCTableauxState } from "../../../types/calculus/nc-tableaux";
import { DPLLState } from "../../../types/calculus/dpll";
import { FOSCState, PSCState } from "../../../types/calculus/sequent";
import { ModalTableauxState } from "../../../types/calculus/modal-tableaux";

interface Props {
    /**
     * The state to save
     */
    state:
        | PropTableauxState
        | PropResolutionState
        | FOTableauxState
        | FOResolutionState
        | NCTableauxState
        | DPLLState
        | PSCState
        | FOSCState
        | ModalTableauxState;
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
        return encodeURIComponent(JSON.stringify({ ...state, type }));
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
