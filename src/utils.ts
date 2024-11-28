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

export const extractLinks = (text: string) => {
  // Regex to match Markdown-style links with any URL scheme
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const matches: { text: string; url: string }[] = [];
  let match;

  // Iterate over all matches
  while ((match = linkRegex.exec(text)) !== null) {
    matches.push({ text: match[1], url: match[2] }); // Extract link text and URL
  }

  return matches;
};

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

export const preprocessMessage = (text: string, targetScheme: string) => {
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
    links: extractLinks(text),
  };
};

/**
 * Converts text with Markdown-style bold (`**bold**`) into HTML bold tags (`<b>`).
 * @param text - The input text containing Markdown-style bold formatting.
 * @returns A string with HTML bold tags.
 */
export const processTextToHTML = (text: string) => {
  return text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
};
