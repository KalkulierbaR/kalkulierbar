import { h, Fragment } from "preact";
import FAB from "../fab";
import UploadIcon from "../icons/upload";
import { CalculusType } from "../../types/app";
import { checkValid } from "../../util/api";
import { useAppState } from "../../util/app-state";
import { readFile } from "../../util/file";
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
        try {
            const state = await readFile(file);

            const valid = await checkValid(server, onError, calculus, state);

            if (valid) {
                onError("4");
                onChange(calculus, JSON.parse(state));
                route(`/${calculus}/view`);
            }
        } catch (e) {
            onError("" + e);
        }
    };

    return (
        <Fragment>
            <input
                onChange={handleUpload}
                ref={input}
                type="file"
                accept="application/json"
                style="display: none;"
            />
            <FAB
                onClick={handleClick}
                label="Load Proof"
                icon={<UploadIcon />}
                showIconAtEnd
                extended
                mini
            />
        </Fragment>
    );
};

export default UploadFAB;
