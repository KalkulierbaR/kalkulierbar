import { h } from "preact";
import FAB from "../../fab";
import CloseIcon from "../../icons/close";

interface Props {}

const TreeControlFAB: preact.FunctionalComponent<Props> = () => {
    return (
        <FAB>
            <CloseIcon fill="#fff" />
        </FAB>
    );
};

export default TreeControlFAB;
