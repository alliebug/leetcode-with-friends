/**
 *
 * @param {function(...any): void} func
 * @param {Number} limit_ms
 */
export function throttle(func, limit_ms) {
    let isThrottling = false; // Captured state of throttling function
    return (...args) => {
        if (!isThrottling) {
            isThrottling = true;
            func(...args);
            setTimeout(() => {isThrottling = false;}, limit_ms);
        }
    }
}