"use strict";
/*example
const text = `
Visit our [homepage](https://example.com) or check our [docs](https://docs.example.com).
You can also use [custom links](custom://example).
`;

const links = extractLinks(text);
console.log(links);

/*
output:
[
  { text: 'homepage', url: 'https://example.com' },
  { text: 'docs', url: 'https://docs.example.com' },
  { text: 'custom links', url: 'custom://example' }
]
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTextToHTML = exports.preprocessMessage = exports.extractLinks = void 0;
const extractLinks = (text) => {
    // Regex to match Markdown-style links with any URL scheme
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const matches = [];
    let match;
    // Iterate over all matches
    while ((match = linkRegex.exec(text)) !== null) {
        matches.push({ text: match[1], url: match[2] }); // Extract link text and URL
    }
    return matches;
};
exports.extractLinks = extractLinks;
/*example
const text = `
Visit our [homepage](https://example.com).
Check our [docs](https://docs.example.com).
Use [custom links](custom://example).
`;

const result = preprocessMessage(text, "custom://");
console.log(result);

//output:

{
  "parts": [
    "Visit our [homepage](https://example.com).",
    "Check our [docs](https://docs.example.com).",
    "<a href=\"custom://example\">custom links</a>"
  ],
  "links": [
    { "text": "homepage", "url": "https://example.com" },
    { "text": "docs", "url": "https://docs.example.com" },
    { "text": "custom links", "url": "custom://example" }
  ]
}

*/
const preprocessMessage = (text, targetScheme) => {
    const lines = text.split("\n");
    const processedLines = lines.map((line) => {
        if (line.includes(targetScheme)) {
            const regex = new RegExp(`\\[(.*?)\\]\\((${targetScheme}[^\)]+)\\)`);
            const match = line.match(regex);
            if (match) {
                const linkText = match[1];
                const linkUrl = match[2];
                return `<a href="${linkUrl}">${linkText}</a>`;
            }
        }
        return line;
    });
    return {
        parts: processedLines,
        links: (0, exports.extractLinks)(text),
    };
};
exports.preprocessMessage = preprocessMessage;
/**
 * Converts text with Markdown-style bold (`**bold**`) into HTML bold tags (`<b>`).
 * @param text - The input text containing Markdown-style bold formatting.
 * @returns A string with HTML bold tags.
 */
const processTextToHTML = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
};
exports.processTextToHTML = processTextToHTML;
