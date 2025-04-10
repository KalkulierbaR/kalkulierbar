import { useState } from "preact/hooks";

/**
 * Gets the value for `key` out of local storage
 * @param {string} key - the key for local storage
 * @returns {V} - the value in local storage
 */
export const localStorageGet = <V>(key: string): V | null => {
    try {
        const value = localStorage.getItem(key) as unknown as V | null;
        return !isNaN(value as number) && value !== null
            ? (parseInt(value as string) as unknown as V)
            : value;
    } catch {
        return null;
    }
};

/**
 * Sets a value in local storage
 * @param {string} key - the key to use
 * @param {string} value - the value to save
 * @returns {void} - void
 */
export const localStorageSet = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.error(e);
    }
};

/**
 * Automatically sync a value to localStorage
 * @param {string} key The key to store the data in
 * @param {any} initial Initial value when no localStorage entry was found
 * @returns {any} - useState like value and setter
 */
export function useStoredValue<V>(
    key: string,
    initial: V,
): [V, (val: V) => void] {
    let stored = localStorageGet<V>(key);
    if (stored == null) {
        stored = initial;
    }

    const [value, setValue] = useState<V>(stored);

    function setStoredValue(v: V) {
        localStorageSet(key, v as unknown as string);
        setValue(v);
    }

    return [value, setStoredValue];
}
