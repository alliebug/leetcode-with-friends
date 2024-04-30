
export class ConfigManager {
    #problemPanelWidth;
    #panelEnabled;
    #darkMode;
    #appEnabled;
    /** @type{(function():void)[]} */
    #changeCallbacks;

    /** @type{Number} */
    #minProblemPanelWidth = 350;
    /** @type{Number} */
    #maxProblemPanelWidth = 800;

    /**
     *
     * @param {Number} problemPanelWidth
     * @param {boolean} panelEnabled
     * @param {boolean} darkMode
     * @param {boolean} appEnabled
     * @private
     */
    constructor(problemPanelWidth, panelEnabled, darkMode, appEnabled) {
        this.#problemPanelWidth = problemPanelWidth;
        this.#panelEnabled = panelEnabled;
        this.#darkMode = darkMode;
        this.#appEnabled = appEnabled;
        this.#changeCallbacks = [];
        chrome.storage.local.onChanged.addListener( this.onChanged.bind(this) );
    }

    /**
     * @returns {Promise<ConfigManager>}
     */
    static async asyncCreateConfig() {
        /** @type{Number} */
        const problemPanelWidth = (await chrome.storage.local.get('problemPanelWidth')).problemPanelWidth ?? 525;
        /** @type{boolean} */
        const panelEnabled = (await chrome.storage.local.get('panelEnabled')).panelEnabled ?? false;
        /** @type{boolean} */
        const darkMode = (await chrome.storage.local.get('darkMode')).darkMode ?? false;
        /** @type{boolean} */
        const appEnabled = (await chrome.storage.local.get('appEnabled')).appEnabled ?? true;
        return new ConfigManager(problemPanelWidth, panelEnabled, darkMode, appEnabled);
    }

    /**
     *
     * @returns {Number}
     */
    getProblemPanelWidth() {
        return this.#problemPanelWidth;
    }
    /**
     *
     * @param {Number} val
     */
    async asyncSetProblemPanelWidth(val) {
        this.#problemPanelWidth = val;
        await chrome.storage.local.set({problemPanelWidth: val});
    }
    /**
     *
     * @param {Number} val
     */
    async setProblemPanelWidth(val) {
        this.#problemPanelWidth = val;
        chrome.storage.local.set({problemPanelWidth: val});
    }

    /**
     *
     * @returns {boolean}
     */
    getDarkMode() {
        return this.#darkMode;
    }
    /**
     *
     * @param {boolean} val
     */
    async asyncSetDarkMode(val) {
        this.#darkMode = val;
        await chrome.storage.local.set({darkMode: val});
    }

    /**
     *
     * @returns {boolean}
     */
    getPanelEnabled() {
        return this.#panelEnabled;
    }
    /**
     *
     * @param {boolean} val
     */
    setPanelEnabled(val) {
        this.#panelEnabled = val;
        chrome.storage.local.set({panelEnabled: val});
    }

    /**
     *
     * @returns {boolean}
     */
    getAppEnabled() {
        return this.#appEnabled;
    }
    /**
     *
     * @param {boolean} val
     */
    async asyncSetAppEnabled(val) {
        this.#appEnabled = val;
        await chrome.storage.local.set({appEnabled: val});
    }

    /**
     *
     * @param {function():void} callback
     */
    addChangeCallback(callback) {
        this.#changeCallbacks.push(callback);
    }

    /**
     *
     * @param {object} changes
     * @param {string} areaName
     */
    onChanged(changes, areaName) {
        for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
            if (key == 'problemPanelWidth') {
                this.#problemPanelWidth = newValue;
            } else if (key == 'panelEnabled') {
                this.#panelEnabled = newValue;
            } else if (key == 'darkMode') {
                this.#darkMode = newValue;
            } else if (key == 'appEnabled') {
                this.#appEnabled = newValue;
            }
        }
        for (let callback of this.#changeCallbacks) {
            callback();
        }
    }

    /**
     *
     * @returns Number
     */
    getMinProblemPanelWidth() {
        return this.#minProblemPanelWidth;
    }

    /**
     *
     * @returns Number
     */
    getMaxProblemPanelWidth() {
        return this.#maxProblemPanelWidth;
    }
}