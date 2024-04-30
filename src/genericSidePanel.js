import { ConfigManager } from "./config.js";

const chevronIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="chevron-icon-svg" width="28" height="28">
    <path
        d="M16.293 14.707a1 1 0 001.414-1.414l-5-5a1 1 0 00-1.414 0l-5 5a1 1 0 101.414 1.414L12 10.414l4.293 4.293z"
        fill-rule="evenodd"
        clip-rule="evenodd"
    ></path>
</svg>
`;

export class GenericSidePanel{
    /** @type{ConfigManager}*/
    #config;
    /** @type{HTMLDivElement} */
    #panelContainer;
    /** @type{HTMLDivElement} */
    #panelTab;
    /** @type{HTMLIFrameElement} */
    #reactFrame;
    /** @type{HTMLDivElement} */
    #openPanelTab;


    /**
     *
     * @param {ConfigManager} config
     */
    constructor(config) {
        this.#config = config;

        this.#panelContainer = document.createElement("div");
        this.#panelContainer.id = "lcwf-panel-container";
        this.#panelContainer.style.display = "none";

        this.#panelTab = document.createElement("div");
        this.#panelTab.id = "lcwf-panel-tab";
        this.#panelTab.style.display = "flex";
        this.#panelTab.innerHTML = chevronIcon;
        const closeText = document.createElement("div");
        closeText.innerHTML = "Hide";
        this.#panelTab.appendChild(closeText);
        this.#panelTab.addEventListener("click", () => {
            this.setPanelEnabled(false, true);
        });

        this.#reactFrame = document.createElement("iframe");
        this.#reactFrame.src = chrome.runtime.getURL('src/react/index.html')
        this.#reactFrame.id = "lcwf-iframe";
        this.#reactFrame.allow = "clipboard-read; clipboard-write";

        this.#openPanelTab = document.createElement("div");
        this.#openPanelTab.id = "lcwf-open-panel-tab";
        this.#openPanelTab.style.display = "none";
        this.#openPanelTab.addEventListener("click", () => {
            this.setPanelEnabled(true, true);
        });

        const openPanelTabChevron = document.createElement("div");
        openPanelTabChevron.id = "lcwf-open-panel-tab-chevron";
        openPanelTabChevron.innerHTML = chevronIcon;

        const openPanelTabText = document.createElement("div");
        openPanelTabText.id = "lcwf-open-panel-tab-text";
        openPanelTabText.innerHTML = "LC&nbsp;With&nbsp;Friends&nbsp;⚔️";

        this.#panelContainer.appendChild(this.#panelTab);
        this.#panelContainer.appendChild(this.#reactFrame);
        openPanelTabText.prepend(openPanelTabChevron);
        this.#openPanelTab.appendChild(openPanelTabText);

        this.setState();
        this.#config.addChangeCallback(this.setState.bind(this));

        document.body.prepend(this.#panelContainer);
        document.body.append(this.#openPanelTab);
    }

    /**
     *
     * @returns {HTMLIFrameElement}
     */
    getReactFrame() {
        return this.#reactFrame;
    }

    setState() {
        this.setDarkMode(this.#config.getDarkMode());
        this.setPanelEnabled(this.#config.getPanelEnabled());
    }

    /**
     *
     * @param {boolean} enabled
     * @param {boolean} notify
     */
    setPanelEnabled(enabled, notify = false) {
        if (enabled) {
            this.#panelContainer.style.display = "block";
            this.#openPanelTab.style.display = "none";
        } else {
            this.#panelContainer.style.display = "none";
            this.#openPanelTab.style.display = "flex";
        }
        if (notify) {
            this.#config.setPanelEnabled(enabled);
        }
    }

    /**
     *
     * @param {boolean} enabled
     */
    setDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add("lcwf-dark");
        } else {
            document.body.classList.remove("lcwf-dark");
        }
    }
}