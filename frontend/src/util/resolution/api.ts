import { APIInformation } from "../../types/app/api";
import {
    PropResolutionState,
    FOResolutionState,
} from "../../types/calculus/resolution";
import { sendMove } from "../api";
import { Calculus, ResolutionCalculusType } from "../../types/calculus";
import { VarAssign } from "../../types/calculus/tableaux";
import { AppState } from "../../types/app/app-state";

/**
 * Send a resolve move (propositional) to the backend
 * @param {number} c1 - The id of the first clause
 * @param {number} c2 - The id of the second clause
 * @param {string} literal - The literal to resolve
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {VoidFunction} onWarning - The function to call when an warning is encountered
 * @returns {void}
 */
export const sendResolve = (
    c1: number,
    c2: number,
    literal: string,
    {
        server,
        state,
        onChange,
        notificationHandler,
    }: APIInformation<PropResolutionState>,
) =>
    sendMove(
        server,
        Calculus.propResolution,
        state,
        { type: "res-resolve", c1, c2, literal },
        onChange,
        notificationHandler,
    );

/**
 * Send a resolve unify move (FO logic) to the backend
 * @param {number} c1 - The id of the first clause
 * @param {number} c2 - The id of the second clause
 * @param {number} l1 - The id of the first atom
 * @param {number} l2 - The id of the second atom
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {VoidFunction} onWarning - The function to call when an warning is encountered
 * @returns {void}
 */
export const sendResolveUnify = (
    c1: number,
    c2: number,
    l1: number,
    l2: number,
    {
        server,
        state,
        onChange,
        notificationHandler,
    }: APIInformation<FOResolutionState>,
) =>
    sendMove(
        server,
        Calculus.foResolution,
        state,
        { type: "res-resolveunify", c1, c2, l1, l2 },
        onChange,
        notificationHandler,
    );

/**
 * Send a resolve move with variable assignments (FO logic) to the backend
 * @param {number} c1 - The id of the first clause
 * @param {number} c2 - The id of the second clause
 * @param {number} l1 - The id of the first atom
 * @param {number} l2 - The id of the second atom
 * @param {VarAssign} varAssign - The variable assignments
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {VoidFunction} onWarning - The function to call when an warning is encountered
 * @returns {void}
 */
export const sendResolveCustom = (
    c1: number,
    c2: number,
    l1: number,
    l2: number,
    varAssign: VarAssign,
    {
        server,
        state,
        onChange,
        notificationHandler,
    }: APIInformation<FOResolutionState>,
) =>
    sendMove(
        server,
        Calculus.foResolution,
        state,
        { type: "res-resolvecustom", c1, c2, l1, l2, varAssign },
        onChange,
        notificationHandler,
    );

/**
 * The function to call when the user hides a clause
 * @param {number} clauseId - The id of the clause to hide
 * @param {ResolutionCalculusType} calculus - Current calculus
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {VoidFunction} onWarning - The function to call when an warning is encountered
 * @returns {void}
 */
export const hideClause = <
    C extends ResolutionCalculusType = ResolutionCalculusType
>(
    clauseId: number,
    calculus: ResolutionCalculusType,
    {
        server,
        state,
        onChange,
        notificationHandler,
    }: APIInformation<AppState[C]>,
) => {
    // Send hide move to backend
    sendMove(
        server,
        calculus,
        state!,
        {
            type: "res-hide",
            c1: clauseId,
        },
        onChange,
        notificationHandler,
    );
};

/**
 * The function to call when the user wants to re-show hidden clauses
 * @param {ResolutionCalculusType} calculus - Current calculus
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {VoidFunction} onWarning - The function to call when an warning is encountered
 * @returns {void}
 */
export const showHiddenClauses = <
    C extends ResolutionCalculusType = ResolutionCalculusType
>(
    calculus: ResolutionCalculusType,
    {
        server,
        state,
        onChange,
        notificationHandler,
    }: APIInformation<AppState[C]>,
) => {
    // Send show move to backend
    sendMove(
        server,
        calculus,
        state!,
        {
            type: "res-show",
        },
        onChange,
        notificationHandler,
    );
};

/**
 * The function to call when the user wants to factorize a clause
 * @param {number} selectedClauseId - The id of the selected clause
 * @param {Set<number>} atoms - The atom indices
 * @param {ResolutionCalculusType} calculus - Current calculus
 * @param {string} server - The server to send a request to
 * @param {AppState} state - The apps state
 * @param {AppStateUpdater} onChange - The AppStateUpdater
 * @param {VoidFunction} onError - The function to call when an error is encountered
 * @param {VoidFunction} onWarning - The function to call when an warning is encountered
 * @returns {void}
 */
export const sendFactorize = <
    C extends ResolutionCalculusType = ResolutionCalculusType
>(
    selectedClauseId: number,
    atoms: Set<number>,
    calculus: ResolutionCalculusType,
    {
        server,
        state,
        onChange,
        notificationHandler,
    }: APIInformation<AppState[C]>,
) => {
    sendMove(
        server,
        calculus,
        state!,
        {
            type: "res-factorize",
            c1: selectedClauseId,
            atoms: Array.from(atoms),
        },
        onChange,
        notificationHandler,
    );
};
