import { h } from "preact";
import FAB from "../../fab";
import CloseIcon from "../../icons/close";

interface Props {}

const TreeControlFAB: preact.FunctionalComponent<Props> = () => {
    return (
        <FAB icon={<CloseIcon fill="#fff" />} label="Open Menu" mini={true} extended={true} />
    );
};

export default TreeControlFAB;
