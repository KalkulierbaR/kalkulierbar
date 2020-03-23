import { TutorialMode, AppStateAction, AppStateActionType } from "../types/app";

/**
 * Returns whether or not the current tutorial mode includes the check button
 * @param {TutorialMode} t - The current tutorial mode
 * @returns {boolean} - Whether to highlight check
 */
export const getHighlightCheck = (t: TutorialMode) =>
    (t & TutorialMode.HighlightCheck) !== 0;

/**
 * Returns whether or not the current tutorial mode includes the FAB button
 * @param {TutorialMode} t - The current tutorial mode
 * @returns {boolean} - Whether to highlight the FAB
 */
export const getHighlightFAB = (t: TutorialMode) =>
    (t & TutorialMode.HighlightFAB) !== 0;

/**
 * Disables a part of the tutorial
 * @param {Function} dispatch - Dispatch function (see app-state)
 * @param {TutorialMode} t - The current tutorial mode
 * @param {TutorialMode} toBeDisabled - The mode to disable
 * @returns {void} - Nothing
 */
export const disableTutorial = (
    dispatch: (a: AppStateAction) => void,
    t: TutorialMode,
    toBeDisabled: TutorialMode,
) =>
    dispatch({
        type: AppStateActionType.SET_TUTORIAL_MODE,
        value: t ^ toBeDisabled,
    });
