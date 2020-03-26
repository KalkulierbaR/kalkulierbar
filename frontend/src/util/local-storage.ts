import { useState } from "preact/hooks";

export const localStorageGet = <V>(key: string): V | null => {
    try {
        const value = (localStorage.getItem(key) as unknown) as V | null;
        return !isNaN(value as any) && value !== null
            ? (parseInt(value as any) as any)
            : value;
    } catch (e) {
        return null;
    }
};

export const localStorageSet = (key: string, value: any) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {}
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
        localStorageSet(key, v);
        setValue(v);
    }

    return [value, setStoredValue];
}
