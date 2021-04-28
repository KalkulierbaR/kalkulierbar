import { h } from "preact";
import { useCallback, useState } from "preact/hooks";

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
    dialogLabel = "Submit Proof Score",
    onClose,
    submitCallback,
    submitLabel = "Submit",
    cancelLabel = "Cancel",
    stats,
    className,
}) => {
    const { smallScreen } = useAppState();

    const memoizedCallback = useCallback(() => {
        setEntries(stats === undefined ? [] : stats.entries);
    }, [stats]);

    const [entries, setEntries] = useState<Map<string, string>[]>(
        stats === undefined ? [] : stats.entries,
    );

    const [asc, setAsc] = useState<boolean>(false);

    const [sortedBy, setSortedBy] = useState<string>("");

    const [nameInput, setNameInput] = useState("");

    /**
     * Submit the close proof with the users name
     * @returns {void}
     */
    const submit = () => {
        if (nameInput === "") return;
        setEntries([]);
        setAsc(false);
        setSortedBy("");
        submitCallback(nameInput);
    };

    /**
     * Handle the KeyDown event of the input fields
     * @param {KeyboardEvent} e - The kayboard event
     * @returns {void}
     */
    const onKeyDown = (e: KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === "Enter") {
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

    /**
     * Sorts the table by column
     * @param {string} key - The index of the column
     * @returns {void}
     */
    const sortByColumn = (key: string) => {
        if (stats === undefined) return;

        let currentAsc: boolean;
        if (sortedBy === key) {
            currentAsc = !asc;
            setAsc(!asc);
        } else {
            currentAsc = false;
            setAsc(false);
        }
        setSortedBy(key);

        const tmp: Map<string, string>[] = [];
        stats.entries.forEach((statEntry) => {
            tmp.push(statEntry);
        });
        tmp.sort((a, b) => {
            const av = a.get(key)!!;
            const bv = b.get(key)!!;
            if (av === bv) return 0;

            const an = parseFloat(av);
            const bn = parseFloat(bv);
            if (isNaN(an) || isNaN(bn)) return av < bv !== currentAsc ? 1 : -1;

            return an < bn !== currentAsc ? 1 : -1;
        });

        setEntries(tmp);
    };

    return (
        <Dialog
            open={open}
            label={dialogLabel}
            onClose={onClose}
            class={className}
        >
            {open && entries.length === 0 && memoizedCallback()}
            {stats !== undefined && (
                <table>
                    <tr>
                        {stats.keys.map((key) => (
                            <td onClick={() => sortByColumn(key)}>{key}</td>
                        ))}
                    </tr>
                    {entries.map((stat) => (
                        <tr>
                            {Array.from(stat.values()).map(
                                (val, index) =>
                                    (index === 0 && val === "" && (
                                        <td>
                                            <TextInput
                                                label={"Your name: "}
                                                inline={true}
                                                onKeyDown={onKeyDown}
                                                onFocus={onFocus}
                                                autoFocus={!smallScreen}
                                                syncValue={nameInput}
                                                onChange={setNameInput}
                                            />
                                        </td>
                                    )) ||
                                    ((index !== 0 || val !== "") && (
                                        <td>{val}</td>
                                    )),
                            )}
                        </tr>
                    ))}
                </table>
            )}
            <Btn onClick={submit} label={submitLabel} />
            <Btn onClick={onClose} label={cancelLabel} />
        </Dialog>
    );
};

export default SaveStatsDialog;
