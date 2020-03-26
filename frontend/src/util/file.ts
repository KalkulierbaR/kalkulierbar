export const readFile = async (f: File) => {
    const supportsModernRead = "text" in f;

    if (supportsModernRead) {
        return await f.text();
    } else {
        const fr = new FileReader();
        const p = new Promise<string>((resolve, reject) => {
            fr.onerror = (e) => reject(e);
            fr.onload = () => resolve(fr.result as string);
        });
        fr.readAsText(f);
        return p;
    }
};
