import { Fragment, h } from "preact";
import { route } from "preact-router";
import { useRef } from "preact/hooks";
import { CalculusType } from "../../types/calculus";
import { checkValid } from "../../util/api";
import { useAppState } from "../../util/app-state";
import { readFile } from "../../util/file";
import FAB from "../fab";
import UploadIcon from "../icons/upload";

interface Props {
    /**
     * The calculus to which the file belongs
     */
    calculus: CalculusType;
}

const UploadFAB: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const { server, onChange, notificationHandler } = useAppState();

    const input = useRef<HTMLInputElement>();

    const handleClick = () => {
        if (!input.current) {
            return;
        }
        input.current.click();
    };

    const handleUpload = async () => {
        if (!input.current || !input.current.files) {
            return;
        }

        const file = input.current.files[0];
        try {
            const state = await readFile(file);

            const valid = await checkValid(
                server,
                notificationHandler,
                calculus,
                state,
            );

            if (valid) {
                onChange(calculus, JSON.parse(state));
                route(`/${calculus}/view`);
            }
        } catch (e) {
            notificationHandler.error("" + e);
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
                showIconAtEnd={true}
                extended={true}
                mini={true}
            />
        </Fragment>
    );
};

export default UploadFAB;
