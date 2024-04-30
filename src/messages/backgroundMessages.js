const backgroundSubmissionMsgType = "BackgroundSubmissionMsg";

/**
 * @typedef {{msgType: string, submissionID: Number, csrftoken: string, session: string}} SubmissionMsg
 */

export class SubmissionMessage {
    #submissionID;
    #csrfToken;
    #session;

    /**
     *
     * @param {Number} submissionID
     * @param {string} csrfToken
     * @param {string} session
     */
    constructor(submissionID, csrfToken, session) {
        this.#submissionID = submissionID;
        this.#csrfToken = csrfToken;
        this.#session = session;
    }

    /**
     *
     * @param {SubmissionMsg} msg
     * @returns
     */
    static fromMsg(msg) {
        if (msg['msgType'] != backgroundSubmissionMsgType) throw new Error(`Received unknown message type: ${msg['msgType']}`);
        return new SubmissionMessage(msg['submissionID'], msg['csrftoken'], msg['session']);
    }

    get submissionID() { return this.#submissionID; }
    get csrfToken() { return this.#csrfToken; }
    get session() { return this.#session; }
}

/**
 * Creates a message that will be sent to the main tab.
 * @param {Number} submissionID
 * @param {string} csrfToken
 * @param {string} session
 * @returns {SubmissionMsg}
 */
export function createBackgroundSubmissionMsg(submissionID, csrfToken, session) {
    return {
        "msgType": backgroundSubmissionMsgType,
        "submissionID": submissionID,
        "csrftoken": csrfToken,
        "session": session
    };
}

/**
 * Exttracts submission ID from msg.
 * @param {Object} msg
 * @returns SubmissionMessage
 */
export function parseSubmissionMessage(msg) {
    return SubmissionMessage.fromMsg(msg);
}
