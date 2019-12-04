import { h } from "preact";
import { Notification, NotificationType } from "../../types/app";

import * as style from "./style.css";

interface Props {
    notification: Notification;
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
            <button class={style.btn} onClick={onDelete}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                >
                    <path
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                        fill="hsla(0, 0%, 100%, 0.87)"
                    />
                    <path d="M0 0h24v24H0z" fill="none" />
                </svg>
            </button>
        </div>
    );
};

export default Snackbar;
