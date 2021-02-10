import FAB from "./index";
import CenterIcon from "../../icons/center";
import { h } from "preact";

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
