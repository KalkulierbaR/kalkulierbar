import { h } from "preact";
import { Notification, NotificationType } from "../../types/app";

import CloseIcon from "../icons/close";
import * as style from "./style.scss";

interface Props {
    /**
     * The notification to display.
     */
    notification: Notification;
    /**
     * Delete handler.
     */
    onDelete: () => void;
}

const Snackbar: preact.FunctionalComponent<Props> = ({
    notification,
    onDelete
}) => {
    let typeClass: string;

    switch (notification.type) {
        case NotificationType.Error:
            typeClass = style.error;
            break;
        case NotificationType.Success:
            typeClass = style.success;
            break;
        default:
            typeClass = style.none;
    }

    typeClass = " " + typeClass;

    return (
        <div class={style.snack + typeClass}>
            {notification.message}
            <button class={style.btn} onClick={onDelete} aria-label="Close">
                <CloseIcon fill="hsla(0, 0%, 100%, 0.87)" />
            </button>
        </div>
    );
};

export default Snackbar;
