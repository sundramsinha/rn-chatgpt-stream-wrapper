"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASSISTANT_ID = exports.OPENAI_HEADERS = exports.OPENAI_API_BASE_URL = void 0;
exports.OPENAI_API_BASE_URL = "https://api.openai.com/v1";
exports.OPENAI_HEADERS = {
    Authorization: `Bearer YOUR_OPENAI_API_KEY`,
    "Content-Type": "application/json",
    "OpenAI-Beta": "assistants=v2",
};
exports.ASSISTANT_ID = "asst_123"; // Replace with your Assistant ID
