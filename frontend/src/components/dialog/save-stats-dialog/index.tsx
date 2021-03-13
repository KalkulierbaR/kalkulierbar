import { h } from "preact";

import Dialog from "..";
import { Statistics } from "../../../types/app/statistics";
import { useAppState } from "../../../util/app-state";
import Btn from "../../input/btn";
import TextInput from "../../input/text";

interface Props {
    /**
     * Opens the dialog
     * Default to "false".
     */
    open: boolean;
    /**
     * The dialog label.
     */
    dialogLabel?: string;
    /**
     * Close handler
     */
    onClose: () => void;
    /**
     * The function to call, when the user submits
     */
    submitCallback: (name: string) => void;
    /**
     * Label for the submit button
     */
    submitLabel?: string;
    /**
     * Label for the Cancel button
     */
     cancelLabel?: string;
    /**
     * Statistics of current Calculus
     */
    stats?: Statistics;
    /**
     * Additional className for the element
     */
    className?: string;
}

const SaveStatsDialog: preact.FunctionalComponent<Props> = ({
    open,
    dialogLabel = "Save Proof Statistics",
    onClose,
    submitCallback,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    stats,
    className,
}) => {
    const { smallScreen } = useAppState();

    /**
     * Submit the close proof with the users name
     * @returns {void}
     */
    const submit = () => {
        const textInput = document.getElementById("name");
        if (
            !(
                textInput &&
                textInput instanceof HTMLInputElement &&
                textInput.value
            )
        ) {
            return;
        }
        submitCallback(textInput.value);
    };

    /**
     * Close the dialog
     * @returns {void}
     */
    const cancel = () => {
        onClose()
    }

    /**
     * Handle the KeyDown event of the input fields
     * @param {KeyboardEvent} e - The kayboard event
     * @returns {void}
     */
    const onKeyDown = (e: KeyboardEvent) => {
        e.stopPropagation();
        if (e.keyCode === 13) {
            submit();
        }
    };

    /**
     * Handle the FocusEvent of the text input
     * @param {FocusEvent} e - The focus event
     * @return {void}
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
            {stats !== undefined && (
                <table>
                    <tr>
                        {stats.columnNames.map((elem) => (
                            <td>
                                {`${elem.toString()}`}
                            </td>

                        ))}
                    </tr>
                    {stats.entries.map((stat) => (
                        <tr>
                            {Object.values(stat).map((val) => (
                                val === null &&
                                    <td>
                                        <TextInput
                                            id={"name"}
                                            label={"Your name : "}
                                            inline={true}
                                            onKeyDown={onKeyDown}
                                            onFocus={onFocus}
                                            autoFocus={!smallScreen}
                                        />
                                    </td> ||
                                val !== null &&
                                    <td>
                                        {`${val.toString()}`}
                                    </td>
                            ))}
                        </tr>
                    ))}
                </table>

            )}
            <Btn onClick={submit} label={submitLabel} />
            <Btn onClick={cancel} label={cancelLabel} />
        </Dialog>
    );
};

export default SaveStatsDialog;
