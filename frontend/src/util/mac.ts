import Keccak from "sha3";

/**
 * @returns {string} - The current date of UTC
 */
export const getCurrentDate = () => {
    const newDate = new Date();
    const date = newDate.getUTCDate();
    const month = newDate.getUTCMonth() + 1;
    const year = newDate.getUTCFullYear();

    return `${year}${month < 10 ? `0${month}` : `${month}`}${date}`;
};

/**
 * @param {string} payload - The payload to hash
 * @returns {string} - The keccak-256 hash of the payload
 */
export const calcMac = (payload: string) => {
    const keccak = new Keccak(256);
    return keccak.update(payload).digest("hex");
};
