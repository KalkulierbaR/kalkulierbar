import { h } from "preact";

import * as style from "./style.scss";
import { useAppState } from "../../../util/app-state";
import { useState, useCallback } from "preact/hooks";
import { AppStateActionType } from "../../../types/app/action";
import TextInput from "../../input/text";
import FAB from "../../fab";
import SaveIcon from "../../icons/save";
import { Theme } from "../../../types/app/theme";
import ThemeLight from "../../icons/theme-light";
import ThemeDark from "../../icons/theme-dark";
import ThemeAuto from "../../icons/theme-auto";
import Btn from "../../btn";

const Settings: preact.FunctionalComponent = () => {
    return (
        <div class={style.settings}>
            <ThemeSwitcher />
            <ServerInput />
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
    const { dispatch, server } = useAppState();
    const [newServer, setServer] = useState(server);

    const dispatchServer = useCallback(() => {
        dispatch({
            type: AppStateActionType.SET_SERVER,
            value: newServer.trim(),
        });
    }, [newServer]);

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
            if (e.keyCode === 13) {
                onSubmit();
            }
        },
        [dispatchServer],
    );

    return (
        <div class={style.serverInputWrapper}>
            <div class={style.overlay} />
            <TextInput
                class={style.serverInput}
                label={showLabel ? "Server" : undefined}
                onChange={setServer}
                value={server}
                type="url"
                autoComplete={true}
                onKeyDown={handleEnter}
                submitButton={
                    <FAB
                        icon={<SaveIcon />}
                        label="Save Server URL"
                        mini={true}
                        onClick={onSubmit}
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
        <div onClick={onClick} class={style.themeContainer}>
            <Btn
                class={style.themeSwitcher}
                title="Change color theme"
                id="theme-switcher"
            >
                {themeSwitcherIcon()}
            </Btn>
            <label for="theme-switcher">Current theme: {theme}</label>
        </div>
    );
};

export default Settings;
