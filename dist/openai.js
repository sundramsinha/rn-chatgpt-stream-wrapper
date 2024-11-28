"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runThread = exports.fetchThreadMessages = exports.addMessageToThread = exports.createThread = void 0;
const axios_1 = __importDefault(require("axios"));
const react_native_sse_1 = __importDefault(require("react-native-sse"));
const constants_1 = require("./constants");
const web_streams_polyfill_1 = require("web-streams-polyfill");
/**
 * Creates a new conversation thread.
 * @returns {Promise<string>} The ID of the newly created thread.
 */
const createThread = async () => {
    try {
        const response = await axios_1.default.post(`${constants_1.OPENAI_API_BASE_URL}/threads`, {
            messages: [
                {
                    role: "assistant",
                    content: [
                        {
                            type: "text",
                            text: `Your role is to help users navigate the app's features and provide clear guidance based on their queries. You will respond professionally and in a friendly manner. Be concise, and wherever applicable, provide a direct link to the requested feature using placeholders for web URLs or app deeplinks based on the user’s platform.`,
                        },
                    ],
                },
            ],
        }, { headers: constants_1.OPENAI_HEADERS });
        return response.data.id; // Returns the thread ID.
    }
    catch (error) {
        console.error("Error creating thread:", error);
        throw new Error("Could not create thread.");
    }
};
exports.createThread = createThread;
/**
 * Adds a user message to an existing thread.
 * @param threadId - The ID of the thread.
 * @param userMessage - The message to be added to the thread.
 * @returns {Promise<any>} The response from the API.
 */
const addMessageToThread = async (threadId, userMessage) => {
    var _a;
    try {
        const response = await axios_1.default.post(`${constants_1.OPENAI_API_BASE_URL}/threads/${threadId}/messages`, {
            role: "user",
            content: [
                {
                    type: "text",
                    text: userMessage,
                },
            ],
        }, { headers: constants_1.OPENAI_HEADERS });
        return response.data;
    }
    catch (error) {
        console.error("Error adding message to thread:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error);
        throw new Error("Could not add message to thread.");
    }
};
exports.addMessageToThread = addMessageToThread;
/**
 * Fetches messages from an existing thread.
 * @param threadId - The ID of the thread.
 * @returns {Promise<any[]>} An array of messages from the thread.
 */
const fetchThreadMessages = async (threadId) => {
    var _a;
    try {
        const response = await axios_1.default.get(`${constants_1.OPENAI_API_BASE_URL}/threads/${threadId}/messages`, { headers: constants_1.OPENAI_HEADERS });
        console.log("Thread Messages:", response.data); // Log for debugging
        return response.data || [];
    }
    catch (error) {
        console.error("Error fetching thread messages:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error);
        throw new Error("Could not fetch thread messages.");
    }
};
exports.fetchThreadMessages = fetchThreadMessages;
/**
 * Streams real-time responses from OpenAI for a given thread.
 * @param threadId - The ID of the thread.
 * @returns {AsyncGenerator<string>} An async generator yielding text chunks.
 */
const runThread = async function* (threadId) {
    const url = `${constants_1.OPENAI_API_BASE_URL}/threads/${threadId}/runs`;
    console.log("Connecting to SSE...");
    const eventSource = new react_native_sse_1.default(url, {
        headers: constants_1.OPENAI_HEADERS,
        method: "POST",
        body: JSON.stringify({
            assistant_id: constants_1.ASSISTANT_ID,
            stream: true,
        }),
    });
    const stream = new web_streams_polyfill_1.ReadableStream({
        start(controller) {
            // @ts-ignore
            eventSource.addEventListener("thread.message.delta", (event) => {
                // @ts-ignore
                const { data } = event;
                if (data) {
                    try {
                        const parsedData = JSON.parse(data);
                        if (parsedData.delta && parsedData.delta.content) {
                            const textDelta = parsedData.delta.content
                                .map((item) => { var _a; return ((_a = item.text) === null || _a === void 0 ? void 0 : _a.value) || ""; })
                                .join("");
                            console.log("Streaming text:", textDelta);
                            controller.enqueue(textDelta); // Enqueue the chunk
                        }
                    }
                    catch (error) {
                        console.error("Error parsing delta event data:", error);
                    }
                }
            });
            // @ts-ignore
            eventSource.addEventListener("thread.run.completed", () => {
                console.log("Run completed.");
                controller.close(); // Close the stream
                eventSource.close();
            });
            eventSource.addEventListener("error", (error) => {
                console.error("SSE Error:", error);
                controller.error(new Error("SSE stream encountered an error."));
                eventSource.close();
            });
        },
    });
    const reader = stream.getReader();
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done)
                break;
            if (value)
                yield value; // Yield each chunk
        }
    }
    finally {
        reader.releaseLock();
        console.log("Stream processing completed.");
    }
};
exports.runThread = runThread;
