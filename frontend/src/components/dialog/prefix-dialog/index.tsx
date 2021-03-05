import { h } from "preact";

import Dialog from "..";
import { NotificationHandler } from "../../../types/app/notification";
import { useAppState } from "../../../util/app-state";
import Btn from "../../input/btn";
import TextInput from "../../input/text";

import * as style from "./style.scss";

interface Props {
    /**
     * Opens the dialog.
     * Defaults to `false`.
     */
    open: boolean;
    /**
     * The dialog label. Used as a heading.
     */
    dialogLabel?: string;
    /**
     * Close handler
     */
    onClose: () => void;
    /**
     * Which atoms are being combined
     */
    prefixOrigin?: string;
    /**
     * The function to call, when the user submits the list
     */
    submitPrefixCallback: (prefix: number) => void;
    /**
     * Label for the submit button
     */
    submitLabel?: string;
    /**
     * Label for the 2nd button
     */
    secondSubmitLabel?: string;
    /**
     * The function to call, when the user clicks the second submit button
     */
    secondSubmitEvent?: (prefix: number) => void;
    /**
     * To Display Notifications
     */
    notificationHandler: NotificationHandler;
    /**
     * Additional className for the element
     */
    className?: string;
}

const PrefixDialog: preact.FunctionalComponent<Props> = ({
    open,
    dialogLabel = "Prefix assignment",
    onClose,
    prefixOrigin,
    submitPrefixCallback,
    submitLabel = "Assign like this",
    notificationHandler,
    className,
}) => {
    const { smallScreen } = useAppState();

    /**
     * Submit the manual prefix by the user
     * @returns {void}
     */
    const submitPrefix = () => {
        const textInput = document.getElementById("prefix");
        if (
            !(
                textInput &&
                textInput instanceof HTMLInputElement &&
                textInput.value
            )
        ) {
            return;
        }
        if (isNaN(+textInput.value)) {
            notificationHandler.error("Only numbers are allowed as prefixes.");
            return;
        }
        submitPrefixCallback(Number(textInput.value));
    };

    /**
     * Handle the KeyDown event of the input fields
     * @param {KeyboardEvent} e - The keyboard event
     * @returns {void}
     */
    const onKeyDown = (e: KeyboardEvent) => {
        e.stopPropagation();
        if (e.keyCode === 13) {
            // Submit prefix when hitting (enter + ctrlKey)
            submitPrefix();
        }
    };

    /**
     * Handle the FocusEvent of the text input
     * @param {FocusEvent} e - The focus event
     * @returns {void}
     */
    const onFocus = (e: FocusEvent) => {
        const target = e.target as HTMLInputElement;
        target.focus();
    };

    return (
        <Dialog
            open={open}
            label={dialogLabel}
            onClose={onClose}
            class={className}
        >
            {prefixOrigin !== undefined && prefixOrigin.length > 0 && (
                <p class={style.originList}>
                    {"For "}
                    <code class={style.origin}>{prefixOrigin}</code>
                </p>
            )}
            <TextInput
                id={"prefix"}
                label={"prefix := "}
                inline={true}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                autoFocus={!smallScreen}
            />
            <Btn onClick={submitPrefix} label={submitLabel} />
        </Dialog>
    );
};

export default PrefixDialog;
