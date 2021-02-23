import { h } from "preact";
import Dialog from "..";
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
     * The prefix to choose
     */
    /**
     * Which atoms are being combined
     */
    prefixOrigins?: string[];
    /**
     * The function to call, when the user submits the list
     */
    submitPrefixCallback: (
        prefix: number
    ) => void;
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
     * Additional className for the element
     */
    className?: string;
}

const PrefixDialog: preact.FunctionalComponent<Props> = ({
    open,
    dialogLabel = "Prefix assignment",
    onClose,
    prefixOrigins = [],
    submitPrefixCallback,
    submitLabel = "Assign like this",
    secondSubmitLabel = "Automatic",
    secondSubmitEvent,
    className,
}) => {

    return (
        <Dialog
            open={open}
            label={dialogLabel}
            onClose={onClose}
            class={className}
        >
            {prefixOrigins !== undefined && prefixOrigins.length > 0 && (
                <p class={style.originList}>
                    {"For "}
                    {prefixOrigins.map((origin, index) => (
                        <span key={index}>
                            <code class={style.origin}>{origin}</code>
                            {index < prefixOrigins.length - 1 && " and "}
                        </span>
                    ))}
                </p>
            )}

        </Dialog>
    )
}