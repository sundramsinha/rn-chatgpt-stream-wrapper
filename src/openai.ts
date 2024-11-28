import axios from "axios";
import EventSource from "react-native-sse";
import { OPENAI_API_BASE_URL, OPENAI_HEADERS, ASSISTANT_ID } from "./constants";

/**
 * Creates a new conversation thread.
 * @returns {Promise<string>} The ID of the newly created thread.
 */

export const createThread = async (): Promise<string> => {
  try {
    const response = await axios.post(
      `${OPENAI_API_BASE_URL}/threads`,
      {
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
      },
      { headers: OPENAI_HEADERS }
    );
    return response.data.id; // Returns the thread ID.
  } catch (error) {
    console.error("Error creating thread:", error);
    throw new Error("Could not create thread.");
  }
};

/**
 * Adds a user message to an existing thread.
 * @param threadId - The ID of the thread.
 * @param userMessage - The message to be added to the thread.
 * @returns {Promise<any>} The response from the API.
 */
export const addMessageToThread = async (
  threadId: string,
  userMessage: string
): Promise<any> => {
  try {
    const response = await axios.post(
      `${OPENAI_API_BASE_URL}/threads/${threadId}/messages`,
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userMessage,
          },
        ],
      },
      { headers: OPENAI_HEADERS }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error adding message to thread:",
      (error as any).response?.data || error
    );
    throw new Error("Could not add message to thread.");
  }
};

/**
 * Fetches messages from an existing thread.
 * @param threadId - The ID of the thread.
 * @returns {Promise<any[]>} An array of messages from the thread.
 */
export const fetchThreadMessages = async (threadId: string): Promise<any[]> => {
  try {
    const response = await axios.get(
      `${OPENAI_API_BASE_URL}/threads/${threadId}/messages`,
      { headers: OPENAI_HEADERS }
    );

    console.log("Thread Messages:", response.data); // Log for debugging
    return response.data || [];
  } catch (error) {
    console.error(
      "Error fetching thread messages:",
      (error as any).response?.data || error
    );
    throw new Error("Could not fetch thread messages.");
  }
};

/**
 * Streams real-time responses from OpenAI for a given thread.
 * @param threadId - The ID of the thread.
 * @returns {AsyncGenerator<string>} An async generator yielding text chunks.
 */
export const runThread = async function* (
  threadId: string
): AsyncGenerator<string> {
  const url = `${OPENAI_API_BASE_URL}/threads/${threadId}/runs`;

  console.log("Connecting to SSE...");

  const eventSource = new EventSource(url, {
    headers: OPENAI_HEADERS,
    method: "POST",
    body: JSON.stringify({
      assistant_id: ASSISTANT_ID,
      stream: true,
    }),
  });

  const stream = new ReadableStream<string>({
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
                .map(
                  (item: { text?: { value?: string } }) =>
                    item.text?.value || ""
                )
                .join("");
              console.log("Streaming text:", textDelta);
              controller.enqueue(textDelta); // Enqueue the chunk
            }
          } catch (error) {
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
      if (done) break;
      if (value) yield value; // Yield each chunk
    }
  } finally {
    reader.releaseLock();
    console.log("Stream processing completed.");
  }
};
