# React Native ChatGPT Wrapper

react-native-chatgpt-wrapper is a TypeScript library designed to integrate OpenAI's API seamlessly into React Native applications. It provides a convenient way to interact with OpenAI's conversational assistant and handle real-time streaming responses using Server-Sent Events (SSE).

This wrapper is ideal for building AI-powered chatbots and virtual assistants with real-time updates.

### Features

- Create Threads: Initialize conversational threads with OpenAI.
- Add Messages: Send user queries to OpenAI's assistant.
- Real-Time Streaming: Handle live, word-by-word responses from OpenAI using SSE.
- Preprocess Messages: Extract links, process Markdown, and generate clickable content.

### Installation

Install the package using npm:

bash
`npm install react-native-chatgpt-wrapper
`

### Setup

Prerequisites

- OpenAI API Key: Obtain an API key from OpenAI.
- React Native Environment: Ensure your React Native app is set up.
- Dependencies: This package requires axios and react-native-sse.
  Install required dependencies:

`npm install axios react-native-sse
`

### Usage

- Import and Configure the Wrapper
  Set up constants to define your OpenAI API credentials:

```
import {
  createThread,
  addMessageToThread,
  runThread,
  preprocessMessage,
} from 'react-native-chatgpt-wrapper';

// Example: Define OpenAI constants
export const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';
export const OPENAI_API_KEY = 'your-openai-api-key'; // Replace with your API key
export const ASSISTANT_ID = 'your-assistant-id'; // Replace with your Assistant ID

```

- Create a Thread
  Initialize a new thread to start a conversation with the assistant.

```
const threadId = await createThread();
console.log('Thread created:', threadId);
```

- Add Messages to the Thread
  Send user messages to the assistant.

```
await addMessageToThread(threadId, "Hello, how can I plan my retirement?");

```

- Stream Responses
  Use the runThread function to handle real-time streaming responses from OpenAI.

```
const stream = runThread(threadId);

for await (const chunk of stream) {
  console.log('Received chunk:', chunk); // Handle each word or sentence as it's streamed
}

```

- Preprocess Messages (Optional)
  The preprocessMessage utility extracts links and processes Markdown content:

```
const result = preprocessMessage("Visit [our site](https://example.com) for more info.");
console.log('Processed Message:', result);

```

### Example Chat Component

Here’s a complete example of using react-native-chatgpt-wrapper to build a chat interface with real-time responses:

```
import React, { useEffect, useState } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { createThread, addMessageToThread, runThread } from 'react-native-chatgpt-wrapper';

const ChatGpt = () => {
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    const initializeThread = async () => {
      const newThreadId = await createThread();
      setThreadId(newThreadId);
    };
    initializeThread();
  }, []);

  const handleSend = async (newMessages = []) => {
    const userMessage = newMessages[0].text;
    setMessages(GiftedChat.append(messages, newMessages));

    if (!threadId) return;

    await addMessageToThread(threadId, userMessage);

    const botMessage = {
      _id: Date.now(),
      text: '',
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'Chatbot',
        avatar: 'https://shorturl.at/r9U',
      },
    };

    setMessages((prevMessages) => GiftedChat.append(prevMessages, [botMessage]));

    for await (const chunk of runThread(threadId)) {
      botMessage.text += chunk;
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[0] = botMessage;
        return updatedMessages;
      });
    }
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMessages) => handleSend(newMessages)}
      user={{ _id: 1 }}
    />
  );
};

export default ChatGpt;

```

## Contributing

Contributions are welcome! Please follow these steps:

- Fork the repository.
- Create a new branch for your feature or bugfix.
- Commit your changes and submit a pull request.

## License

This project is licensed under the MIT License.
