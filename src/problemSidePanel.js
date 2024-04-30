import { ConfigManager } from "./config.js";
import { throttle } from "./utils/throttle.js";
import { waitForElement } from "./utils/waitFor.js";

const XIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" class="xicon-svg" viewBox="0 0 24 24" width="18" height="18">
<path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M13.414 12L19 17.586A1 1 0 0117.586 19L12 13.414 6.414 19A1 1 0 015 17.586L10.586 12 5 6.414A1 1 0 116.414 5L12 10.586 17.586 5A1 1 0 1119 6.414L13.414 12z"
></path>
</svg>`;

const dragHandlebarSVG = `<svg class="handlebar-svg" id="drag-handlebar-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 14" width="2" height="14">
<circle r="1" transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 1 1)"></circle>
<circle r="1" transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 1 7)"></circle>
<circle r="1" transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 1 13)"></circle>
    </svg>`;

const openHandlebarSVG = `<svg class="handlebar-svg" id="open-handlebar-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
    <path fill-rule="evenodd" d="M7.913 19.071l7.057-7.078-7.057-7.064a1 1 0 011.414-1.414l7.764 7.77a1 1 0 010 1.415l-7.764 7.785a1 1 0 01-1.414-1.414z" clip-rule="evenodd"></path>
    </svg>`;

export class ProblemSidePanel{
    /** @type{ConfigManager}*/
    #config;
    /** @type{HTMLDivElement} */
    #handlebar;
    /** @type{HTMLDivElement} */
    #overlay;
    /** @type{HTMLIFrameElement} */
    #reactFrame;

    /** @type{boolean} */
    #isResizing = false;
    /** @type{Number} */
    #resizingInitMouseX = 0;

    /**
     *
     * @param {ConfigManager} config
     * @private
     */
    constructor(config) {
        this.#config = config;

        this.#reactFrame = document.createElement("iframe");
        this.#reactFrame.src = chrome.runtime.getURL('src/react/index.html')
        this.#reactFrame.id = "lcwf-iframe";
        this.#reactFrame.allow = "clipboard-read; clipboard-write";

        this.#handlebar = document.createElement("div");
        this.#handlebar.id = "lcwf-handlebar";
        this.#handlebar.style.minWidth = "8px";
        this.#handlebar.style.userSelect = "none"; // This line disables text selection on the handlebar
        this.#handlebar.style.position = "relative";
        this.#handlebar.style.left = "-4px";
        this.#handlebar.addEventListener("dblclick", () => {
            this.setPanelEnabled(!this.#config.getPanelEnabled(), true);
        });
        this.#handlebar.addEventListener("mousedown", (event) => {
            if (this.#config.getPanelEnabled()) {
                this.#isResizing = true;
                this.#resizingInitMouseX = event.clientX;
                this.#overlay.style.display = "block";
            }
        });
        this.#handlebar.addEventListener("dragstart", (event) => event.preventDefault());
        document.addEventListener("mousemove", throttle(this.updateWidthOnResize.bind(this), 16));
        document.addEventListener("mouseup", (event) => {
            this.#isResizing = false;
            this.#overlay.style.display = "none";
        });

        this.#overlay = document.createElement("div");
        this.#overlay.style.position = "absolute";
        this.#overlay.style.top = "0";
        this.#overlay.style.left = "0";
        this.#overlay.style.width = "100%";
        this.#overlay.style.height = "100%";
        this.#overlay.style.display = "none";

        this.setState()

    }

    /**
     *
     * @param {ConfigManager} config
     * @returns {Promise<ProblemSidePanel>}
     */
    static async asyncCreateProblemPanel(config) {
        const problemSidePanel = new ProblemSidePanel(config);
        const problemContentPanel = await waitForElement(['#qd-content']); //Wait for the main content panel to load

        problemContentPanel.insertAdjacentElement("afterend", problemSidePanel.#overlay);
        problemContentPanel.insertAdjacentElement("afterend", problemSidePanel.#reactFrame);
        problemContentPanel.insertAdjacentElement("afterend", problemSidePanel.#handlebar);

        return problemSidePanel;
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
        this.setPanelWidth(this.#config.getProblemPanelWidth())
    }

    /**
     *
     * @param {boolean} enabled
     * @param {boolean} notify
     */
    setPanelEnabled(enabled, notify = false) {
        if (enabled) {
            this.#reactFrame.style.display = "block";
            this.#handlebar.innerHTML = dragHandlebarSVG;
            this.#handlebar.style.cursor = "col-resize";
            this.#handlebar.style.zIndex = "10";
        } else {
            this.#reactFrame.style.display = "none";
            this.#handlebar.innerHTML = openHandlebarSVG;
            this.#handlebar.style.cursor = "pointer";
            this.#handlebar.style.zIndex = "0";
        }
        if (notify) {
            this.#config.setPanelEnabled(enabled);
        }
    }

    /**
     *
     * @param {Number} width
     * @param {boolean} notify
     */
    setPanelWidth(width, notify = false) {
        this.#reactFrame.style.width = `${width}px`;
        if (notify) {
            this.#config.setProblemPanelWidth(width);
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

    /**
     *
     * @param {MouseEvent} event
     */
    updateWidthOnResize(event) {
        if (!this.#isResizing) return;
        const deltaWidth = this.#resizingInitMouseX - event.clientX;
        this.#resizingInitMouseX = event.clientX;
        if (this.#config.getPanelEnabled() && window.innerWidth - event.clientX < 100) {
            this.setPanelEnabled(false, true);
        } else if (!this.#config.getPanelEnabled() && window.innerWidth - event.clientX > 100) {
            this.setPanelEnabled(true, true);
        } else {
            const oldWidth = this.#config.getProblemPanelWidth();
            let newWidth = Math.min(
                Math.max(oldWidth + deltaWidth, this.#config.getMinProblemPanelWidth()),
                this.#config.getMaxProblemPanelWidth()
            );
            this.setPanelWidth(newWidth, true);
        }
    }
}
