import { createBackgroundSubmissionMsg } from "./messages/backgroundMessages.js";

/*
Apparently many of the chrome events are only accessible with service workers.
*/

chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        sendSubmissionMessage(details.url);
    },
    { urls: ["https://leetcode.com/submissions/*"] }
);


/**
 * Extracts submission ID
 * @param {string} url
 * @returns {number}
 */
function extractSubmissionID(url) {
    const toks = url.split('/');
    return parseInt(toks[5]);
}

let lastSubmissionID = undefined;

/**
 * Sends submission message to the main tab.
 * @param {string} url
 */
async function sendSubmissionMessage(url) {
    const submissionID = extractSubmissionID(url);
    if (isNaN(submissionID)) {
        console.log(`Error extracting submissionID from url=${url}`);
    } else {
        if (submissionID == lastSubmissionID) return;
        lastSubmissionID = submissionID;
        const csrfToken = (await chrome.cookies.get({name: 'csrftoken', url: 'https://leetcode.com'}))?.value;
        const session = (await chrome.cookies.get({name: 'LEETCODE_SESSION', url: 'https://leetcode.com'}))?.value;
        if (csrfToken === undefined || session == undefined) {
            console.log(`csrfToken or session is missing`)
        } else {
            const msg = createBackgroundSubmissionMsg(submissionID, csrfToken, session);
            console.log(`sendSubmissionMessage: ${JSON.stringify(msg)}`);
            chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                    if (tabs[0] && tabs[0].id) {
                        chrome.tabs.sendMessage(tabs[0].id, msg);
                    }
                }
            );
        }
    }
}