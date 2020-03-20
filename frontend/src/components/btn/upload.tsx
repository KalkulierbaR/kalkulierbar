import { h, Fragment } from "preact";
import FAB from "../fab";
import UploadIcon from "../icons/upload";
import { CalculusType } from "../../types/app";
import { checkValid } from "../../util/api";
import { useAppState } from "../../util/app-state";
import { useRef } from "preact/hooks";
import { route } from "preact-router";

interface Props {
    calculus: CalculusType;
}

const UploadFAB: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const { server, onChange, onError } = useAppState();

    const input = useRef<HTMLInputElement>();

    const handleClick = () => {
        if (!input.current) return;
        input.current.click();
    };

    const handleUpload = async () => {
        if (!input.current || !input.current.files) return;

        const file = input.current.files[0];

        const state = await file.text();

        const valid = await checkValid(server, onError, calculus, state);

        if (valid) {
            onChange(calculus, JSON.parse(state));
            route(`/${calculus}/view`);
        }
    };

    return (
        <Fragment>
            <input
                onInput={handleUpload}
                ref={input}
                type="file"
                style="display: none;"
            />
            <FAB
                onClick={handleClick}
                label="Upload"
                icon={<UploadIcon />}
                showIconAtEnd
                extended
                mini
            />
        </Fragment>
    );
};

export default UploadFAB;
