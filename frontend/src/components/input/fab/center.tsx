import {h} from "preact";

import CenterIcon from "../../icons/center";

import FAB from "./index";

interface Props {
    /**
     * Callback to reset all drags
     */
    resetDragTransforms?: () => void;
}

const CenterFAB: preact.FunctionalComponent<Props> = ({
    resetDragTransforms,
}) => (
    <FAB
        mini={true}
        extended={true}
        label="Center"
        showIconAtEnd={true}
        icon={<CenterIcon />}
        onClick={() => {
            dispatchEvent(new CustomEvent("center"));
            if (resetDragTransforms !== undefined) {
                resetDragTransforms();
            }
        }}
    />
);

export default CenterFAB;
