import { SubmissionMessage } from "./messages/backgroundMessages.js";
import { ConfigManager } from "./config.js";
import { GenericSidePanel } from "./genericSidePanel.js";
import { ProblemSidePanel } from "./problemSidePanel.js";
import { LeetcodeStatusCode} from "./utils/lcEnums.js"

/**
 * @returns {Promise<HTMLElement>}
 */
async function setupProblemSidePanel() {
    /* On the problems page, the element with id qd-content is the last child of the lower content pane we want to insert into */
    const config = await ConfigManager.asyncCreateConfig();
    const panel = await ProblemSidePanel.asyncCreateProblemPanel(config);
    return panel.getReactFrame();
}

/**
 * @returns {Promise<HTMLElement>}
 */
async function setupGenericSidePanel() {
    /* If we aren't on the problems page, there isn't a clear panel to be added to, so we just create a fixed side pane. */
    const config = await ConfigManager.asyncCreateConfig();
    const panel = new GenericSidePanel(config);
    return panel.getReactFrame();
}

export async function main() {
    const url = window.location.href;
    let mainFrame;
    if (url.startsWith('https://leetcode.com/problems/')) {
        mainFrame = await setupProblemSidePanel();
    } else {
        mainFrame = await setupGenericSidePanel();
    }
    registerMessageListener();
}

function registerMessageListener() {
    console.log('Registering message listener from background worker');
    /** @type {Number | null} */
    let previousSubmissionID = null; //Used as state in closure
    chrome.runtime.onMessage.addListener(
        (message, sender, sendresponse) => {
            const msg = SubmissionMessage.fromMsg(message);
            if (!isNaN(msg.submissionID) && msg.submissionID != previousSubmissionID) {
                console.log(`Received submission ${msg.submissionID}, sender=${JSON.stringify(sender)}`);
                previousSubmissionID = msg.submissionID;
                query(msg.submissionID, msg.csrfToken, msg.session);
            } else {
                console.log(`Ignoring message: submissionID=${msg.submissionID}, previousSubmissionID=${previousSubmissionID}`);
            }
        }
    );
}


/**
 *
 * @param {Number} submissionID
 * @param {string} csrfToken
 * @param {string} session
 */
async function query(submissionID, csrfToken, session) {
    let counter = 0;
    const timer = setInterval(async () => {
        const url = "https://leetcode.com/graphql/";
        const body = `{"query":"\\n    query submissionDetails($submissionId: Int!) {\\n  submissionDetails(submissionId: $submissionId) {\\n    runtime\\n    runtimeDisplay\\n    runtimePercentile\\n    runtimeDistribution\\n    memory\\n    memoryDisplay\\n    memoryPercentile\\n    memoryDistribution\\n    code\\n    timestamp\\n    statusCode\\n    user {\\n      username\\n      profile {\\n        realName\\n        userAvatar\\n      }\\n    }\\n    lang {\\n      name\\n      verboseName\\n    }\\n    question {\\n      questionId\\n      titleSlug\\n      hasFrontendPreview\\n    }\\n    notes\\n    flagType\\n    topicTags {\\n      tagId\\n      slug\\n      name\\n    }\\n    runtimeError\\n    compileError\\n    lastTestcase\\n    codeOutput\\n    expectedOutput\\n    totalCorrect\\n    totalTestcases\\n    fullCodeOutput\\n    testDescriptions\\n    testBodies\\n    testInfo\\n    stdOutput\\n  }\\n}\\n    ","variables":{"submissionId":${submissionID}},"operationName":"submissionDetails"}`
        const headers = {
            "Accept-Encoding": "application/json",
            "X-Csrftoken": csrfToken,
            "Content-Type": "application/json",
            "Cookie": `csrftoken=${csrfToken}; LEETCODE_SESSION=${session};`
        };
        try {
            const response = await fetch(url, {
                method: "POST",
                body: body,
                headers: headers
            });
            let statusCode = undefined;
            if (response.ok) {
                const responseData = await response.json();
                console.log(responseData);
                statusCode = responseData.data?.submissionDetails?.statusCode;
            }
            if (statusCode === undefined || statusCode === LeetcodeStatusCode.GRADING) {
                counter += 1;
                console.log(`counter=${counter}`);
                if (counter >= 6) clearInterval(timer);
            } else {
                console.log(`status=${statusCode}`);
                clearInterval(timer);
            }
        } catch (e) {
            console.log(e);
            clearInterval(timer);
        }
    }, 10000);
}