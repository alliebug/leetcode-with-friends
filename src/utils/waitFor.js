/**
 * Asynchronous function that waits for one of a list of selectors to exist.
 *
 * @param {string[]} selectors
 * @returns {Promise<Element>}
 */
export function waitForElement(selectors) {
    return new Promise(resolve => {
        for (const selector of selectors) {
            const elt = document.querySelector(selector);
            if (elt) {
                resolve(elt);
                return;
            }
        }
        const observer = new MutationObserver(mutations => {
            for (const selector of selectors) {
                const elt = document.querySelector(selector);
                if (elt) {
                    resolve(elt);
                    observer.disconnect();
                    return;
                }

            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    });
}