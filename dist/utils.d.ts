export declare const extractLinks: (text: string) => {
    text: string;
    url: string;
}[];
export declare const preprocessMessage: (text: string, targetScheme: string) => {
    parts: string[];
    links: {
        text: string;
        url: string;
    }[];
};
/**
 * Converts text with Markdown-style bold (`**bold**`) into HTML bold tags (`<b>`).
 * @param text - The input text containing Markdown-style bold formatting.
 * @returns A string with HTML bold tags.
 */
export declare const processTextToHTML: (text: string) => string;
