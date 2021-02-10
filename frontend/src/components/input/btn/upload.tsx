import { Fragment, h } from "preact";
import { route } from "preact-router";
import { useRef } from "preact/hooks";

import { CalculusType } from "../../../types/calculus";
import { checkValid } from "../../../util/api";
import { useAppState } from "../../../util/app-state";
import { readFile } from "../../../util/file";
import UploadIcon from "../../icons/upload";

import Btn from "./index";

interface Props {
    /**
     * The calculus to which the file belongs
     */
    calculus: CalculusType;
}

const UploadButton: preact.FunctionalComponent<Props> = ({ calculus }) => {
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

            const jsonState = JSON.parse(state);

            if (typeof jsonState.type !== "string") {
                notificationHandler.error(
                    "The uploaded state is missing the `type` field.",
                );
                return;
            }

            if (jsonState.type !== calculus) {
                notificationHandler.error(
                    `Expected a state for calculus ${calculus}. Instead got state for ${jsonState.type}.`,
                );
                return;
            }

            delete jsonState.type;

            const valid = await checkValid(
                server,
                notificationHandler,
                calculus,
                JSON.stringify(jsonState),
            );

            if (valid) {
                onChange(calculus, jsonState);
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
            <Btn
                onClick={handleClick}
                label="Load proof"
                icon={<UploadIcon />}
            />
        </Fragment>
    );
};

export default UploadButton;
