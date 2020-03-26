/**
 * Read a user file
 * @param {File} f - The file to read
 * @returns {Promise} - The promise
 */
export const readFile = async (f: File) => {
    const supportsModernRead = "text" in f;

    if (supportsModernRead) {
        return await f.text();
    }

    const fr = new FileReader();
    const p = new Promise<string>((resolve, reject) => {
        fr.onerror = (e) => reject(e);
        fr.onload = () => resolve(fr.result as string);
    });
    fr.readAsText(f);
    return p;
};
