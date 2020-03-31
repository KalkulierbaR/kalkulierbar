export enum NotificationType {
    Error,
    Success,
    Warning,
    None,
}

export interface Notification {
    message: string;
    type: NotificationType;
}

/**
 * An object that has methods to dispatch notifications
 */
export interface NotificationHandler {
    /**
     * Dispatches a message of type `type`
     */
    message: (type: NotificationType, msg: string) => void;
    /**
     * Dispatches an error message
     */
    error: (msg: string) => void;
    /**
     * Dispatches an success message
     */
    success: (msg: string) => void;
    /**
     * Dispatches an warning message
     */
    warning: (msg: string) => void;
    /**
     * Removes the current message
     */
    remove: () => void;
}
