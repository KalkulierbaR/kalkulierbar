import { h } from "preact";
import { useCallback, useState } from "preact/hooks";

import Dialog from "..";
import { Statistics } from "../../../types/app/statistics";
import { StatisticEntry } from "../../../types/calculus";
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

    const memoizedCallback = useCallback(() => {
        if (stats === undefined) setEntries([]);
        else {
            sortByColumn(stats.columnNames.length);
        }
    }, [stats]);

    const [entries, setEntries] = useState<StatisticEntry[]>(
        stats === undefined ? [] : stats.entries,
    );

    const [asc, setAsc] = useState<boolean>(false);

    const [sortedBy, setSortedBy] = useState<number>(-1);

    /**
     * Submit the close proof with the users name
     * @returns {void}
     */
    const submit = () => {
        // FIXME: Use state instead of DOM-read (and never read DOM, ever)
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
        setEntries([]);
        setAsc(false);
        setSortedBy(-1);
        submitCallback(textInput.value);
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
     * @param {number} columnIndex - The index of the column
     * @returns {void}
     */
    const sortByColumn = (columnIndex: number) => {
        if (stats === undefined) return;

        let currentAsc: boolean;
        if (sortedBy === columnIndex) {
            currentAsc = !asc;
            setAsc(!asc);
        } else {
            currentAsc = false;
            setAsc(false);
        }
        setSortedBy(columnIndex);

        const tmp: StatisticEntry[] = [];
        stats.entries.forEach((elem) => {
            tmp.push(elem);
        });
        tmp.sort((a, b) => {
            if (Object.values(a)[columnIndex] < Object.values(b)[columnIndex])
                return currentAsc ? -1 : 1;
            if (Object.values(a)[columnIndex] === Object.values(b)[columnIndex])
                return 0;

            return currentAsc ? 1 : -1;
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
                        {stats.columnNames.map((elem, index) => (
                            <td onClick={() => sortByColumn(index + 1)}>
                                {`${elem.toString()}`}
                            </td>
                        ))}
                    </tr>
                    {entries.map((stat) => (
                        <tr>
                            {Object.values(stat).map(
                                (val, index) =>
                                    (index !== 0 && val === null && (
                                        <td>
                                            <TextInput
                                                id={"name"}
                                                label={"Your name : "}
                                                inline={true}
                                                onKeyDown={onKeyDown}
                                                onFocus={onFocus}
                                                autoFocus={!smallScreen}
                                            />
                                        </td>
                                    )) ||
                                    (index !== 0 && val !== null && (
                                        <td>{`${val.toString()}`}</td>
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
