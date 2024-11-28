/**
 * Creates a new conversation thread.
 * @returns {Promise<string>} The ID of the newly created thread.
 */
export declare const createThread: () => Promise<string>;
/**
 * Adds a user message to an existing thread.
 * @param threadId - The ID of the thread.
 * @param userMessage - The message to be added to the thread.
 * @returns {Promise<any>} The response from the API.
 */
export declare const addMessageToThread: (threadId: string, userMessage: string) => Promise<any>;
/**
 * Fetches messages from an existing thread.
 * @param threadId - The ID of the thread.
 * @returns {Promise<any[]>} An array of messages from the thread.
 */
export declare const fetchThreadMessages: (threadId: string) => Promise<any[]>;
/**
 * Streams real-time responses from OpenAI for a given thread.
 * @param threadId - The ID of the thread.
 * @returns {AsyncGenerator<string>} An async generator yielding text chunks.
 */
export declare const runThread: (threadId: string) => AsyncGenerator<string>;
