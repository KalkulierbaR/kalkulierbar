import { h } from "preact";
import { useCallback, useState } from "preact/hooks";

import { AppStateActionType } from "../../../types/app/action";
import { Theme } from "../../../types/app/theme";
import { checkCredentials } from "../../../util/admin";
import { useAppState } from "../../../util/app-state";
import LogInIcon from "../../icons/log-in";
import LogOutIcon from "../../icons/log-out";
import SaveIcon from "../../icons/save";
import ThemeAuto from "../../icons/theme-auto";
import ThemeDark from "../../icons/theme-dark";
import ThemeLight from "../../icons/theme-light";
import Btn from "../../input/btn";
import FAB from "../../input/fab";
import TextInput from "../../input/text";

import * as style from "./style.scss";

const Settings: preact.FunctionalComponent = () => {
    return (
        <div class={style.settings}>
            <ThemeSwitcher />
            <ServerInput />
            <AdminKeyInput />
        </div>
    );
};

interface ServerInputProps {
    /**
     * Whether to show the label
     */
    showLabel?: boolean;
    /**
     * Function for closing the surrounding dialog
     */
    close?: () => void;
}

const ServerInput: preact.FunctionalComponent<ServerInputProps> = ({
    showLabel = true,
    close,
}) => {
    const { dispatch, server, notificationHandler } = useAppState();
    const [serverInput, setServerInput] = useState(server);

    const dispatchServer = useCallback(() => {
        const value = serverInput.trim();
        dispatch({
            type: AppStateActionType.SET_SERVER,
            value,
        });
        fetch(value).then(() =>
            notificationHandler.success("Server was successfully changed"),
        );
    }, [serverInput]);

    const onSubmit = useCallback(() => {
        dispatchServer();
        if (document.activeElement) {
            (document.activeElement as HTMLElement).blur();
        }
        if (close) {
            close();
        }
    }, [dispatchServer]);

    const handleEnter = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                onSubmit();
            }
        },
        [dispatchServer],
    );

    return (
        <div class={style.settingsInputWrapper}>
            <TextInput
                class={style.settingsInput}
                label={showLabel ? "Server" : undefined}
                onChange={setServerInput}
                syncValue={serverInput}
                type="url"
                autoComplete={true}
                onKeyDown={handleEnter}
                submitButton={
                    <FAB
                        icon={<SaveIcon />}
                        label="Save Server URL"
                        mini={true}
                        onClick={onSubmit}
                        disabled={serverInput.length === 0}
                    />
                }
            />
        </div>
    );
};

const AdminKeyInput: preact.FunctionalComponent<ServerInputProps> = ({
    showLabel = true,
    close,
}) => {
    const { dispatch, isAdmin, adminKey, notificationHandler, server } =
        useAppState();

    const [adminKeyInput, setAdminKeyInput] = useState(adminKey);

    const dispatchAdminKey = useCallback(() => {
        dispatch({
            type: AppStateActionType.SET_ADMIN_KEY,
            value: adminKeyInput,
        });
    }, [adminKeyInput]);

    const onSubmit = useCallback(() => {
        dispatchAdminKey();
        checkCredentials(
            server,
            adminKeyInput,
            (userIsAdmin) => {
                dispatch({
                    type: AppStateActionType.SET_ADMIN,
                    value: userIsAdmin,
                });
            },
            notificationHandler,
        );
        setAdminKeyInput("");

        if (document.activeElement) {
            (document.activeElement as HTMLElement).blur();
        }
        if (close) {
            close();
        }
    }, [dispatchAdminKey]);

    const handleEnter = useCallback(
        (e: KeyboardEvent) => {
            if (e.keyCode === 13) {
                onSubmit();
            }
        },
        [dispatchAdminKey],
    );

    return isAdmin ? (
        <div class={style.buttonContainer}>
            <Btn
                className={style.themeSwitcher}
                icon={<LogOutIcon />}
                label="Logout"
                onClick={() =>
                    dispatch({
                        type: AppStateActionType.SET_ADMIN,
                        value: false,
                    })
                }
            />
        </div>
    ) : (
        <div class={style.settingsInputWrapper}>
            <TextInput
                class={style.settingsInput}
                label={showLabel ? "Admin Login" : undefined}
                onChange={setAdminKeyInput}
                syncValue={adminKeyInput}
                type="password"
                autoComplete={true}
                onKeyDown={handleEnter}
                submitButton={
                    <FAB
                        icon={<LogInIcon />}
                        label="Login"
                        mini={true}
                        onClick={onSubmit}
                        disabled={adminKeyInput.length === 0}
                    />
                }
            />
        </div>
    );
};

const ThemeSwitcher: preact.FunctionalComponent = () => {
    const { theme, dispatch } = useAppState();

    const onClick = () => {
        let newTheme: Theme;
        switch (theme) {
            case Theme.light:
                newTheme = Theme.auto;
                break;
            case Theme.dark:
                newTheme = Theme.light;
                break;
            case Theme.auto:
                newTheme = Theme.dark;
                break;
        }
        dispatch({ type: AppStateActionType.SET_THEME, value: newTheme });
    };

    const themeSwitcherIcon = () => {
        switch (theme) {
            case Theme.light:
                return <ThemeLight />;
            case Theme.dark:
                return <ThemeDark />;
            case Theme.auto:
                return <ThemeAuto />;
        }
    };

    return (
        <div class={style.buttonContainer}>
            <Btn
                onClick={onClick}
                className={style.themeSwitcher}
                icon={themeSwitcherIcon()}
                label={`Theme:  ${theme}`}
            />
        </div>
    );
};

export default Settings;
