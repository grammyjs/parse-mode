import type { MessageEntity } from "./deps.deno.ts";

/**
 * Parser states for the finite state automaton
 */
enum ParserState {
  DATA_STATE,
  TAG_OPEN_STATE,
  TAG_NAME_STATE,
  CLOSE_TAG_STATE,
  CLOSE_TAG_NAME_STATE,
  ATTRIBUTE_STATE,
}

/**
 * Represents a node in the parsed HTML tree
 */
interface ParseNode {
  type: "text" | "open_tag" | "close_tag";
  content: string;
  attributes?: Map<string, string>;
}

/**
 * Represents an open tag that is waiting to be closed
 */
interface OpenTag {
  tagName: string;
  startOffset: number;
  attributes?: Map<string, string>;
}

/**
 * Maps HTML tag names to Telegram entity types
 */
const TAG_TO_ENTITY_TYPE: Record<string, MessageEntity["type"]> = {
  "b": "bold",
  "strong": "bold",
  "i": "italic",
  "em": "italic",
  "u": "underline",
  "ins": "underline",
  "s": "strikethrough",
  "strike": "strikethrough",
  "del": "strikethrough",
  "code": "code",
  "pre": "pre",
  "a": "text_link",
  "tg-spoiler": "spoiler",
  "blockquote": "blockquote",
  "tg-emoji": "custom_emoji",
};

/**
 * Helper function to check if a character is a letter (a-z, A-Z)
 */
function isLetter(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

/**
 * Helper function to check if a character is a digit (0-9)
 */
function isDigit(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 48 && code <= 57;
}

/**
 * Helper function to check if a character is a hex digit (0-9, a-f, A-F)
 */
function isHexDigit(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 70) || // A-F
    (code >= 97 && code <= 102); // a-f
}

/**
 * Helper function to check if a character is whitespace
 */
function isWhitespace(char: string): boolean {
  return char === " " || char === "\t" || char === "\n" || char === "\r";
}

/**
 * Helper function to check if a character is alphanumeric or hyphen
 */
function isAlphanumericOrHyphen(char: string): boolean {
  return isLetter(char) || isDigit(char) || char === "-";
}

/**
 * Parses an HTML entity starting at position i
 * Returns { decoded: string, length: number } or null if not a valid entity
 */
function parseHtmlEntity(html: string, i: number): {
  decoded: string;
  length: number;
} | null {
  if (html[i] !== "&") return null;

  let j = i + 1;
  if (j >= html.length) return null;

  // Check for numeric entity &#123; or &#xAB;
  if (html[j] === "#") {
    j++;
    if (j >= html.length) return null;

    let isHex = false;
    if (html[j] === "x" || html[j] === "X") {
      isHex = true;
      j++;
      if (j >= html.length) return null;
    }

    let numStr = "";
    const checkDigit = isHex ? isHexDigit : isDigit;

    while (j < html.length && checkDigit(html[j])) {
      numStr += html[j];
      j++;
    }

    if (numStr.length === 0 || j >= html.length || html[j] !== ";") {
      return null;
    }

    const codePoint = parseInt(numStr, isHex ? 16 : 10);
    return {
      decoded: String.fromCodePoint(codePoint),
      length: j - i + 1,
    };
  }

  // Check for named entity &lt; &gt; &amp; &quot;
  let entityName = "";
  while (j < html.length && isLetter(html[j])) {
    entityName += html[j];
    j++;
  }

  if (entityName.length === 0 || j >= html.length || html[j] !== ";") {
    return null;
  }

  let decoded: string | null = null;
  if (entityName === "lt") decoded = "<";
  else if (entityName === "gt") decoded = ">";
  else if (entityName === "amp") decoded = "&";
  else if (entityName === "quot") decoded = '"';

  if (decoded === null) return null;

  return {
    decoded,
    length: j - i + 1,
  };
}

/**
 * Parses HTML string into text and message entities
 * @param html The HTML string to parse
 * @returns Object containing plain text and entities array
 */
export function parseHtml(html: string): {
  text: string;
  entities: MessageEntity[];
} {
  let state = ParserState.DATA_STATE;
  let currentBuffer = "";
  const nodes: ParseNode[] = [];
  let attributeBuffer = "";

  // Loop through each character
  for (let i = 0; i < html.length; i++) {
    const char = html[i];

    switch (state) {
      case ParserState.DATA_STATE:
        if (char === "<") {
          // Save accumulated text
          if (currentBuffer.length > 0) {
            nodes.push({ type: "text", content: currentBuffer });
            currentBuffer = "";
          }
          state = ParserState.TAG_OPEN_STATE;
        } else {
          // Decode HTML entities
          if (char === "&") {
            const entityResult = parseHtmlEntity(html, i);
            if (entityResult) {
              currentBuffer += entityResult.decoded;
              i += entityResult.length - 1;
            } else {
              currentBuffer += char;
            }
          } else {
            currentBuffer += char;
          }
        }
        break;

      case ParserState.TAG_OPEN_STATE:
        if (char === "/") {
          state = ParserState.CLOSE_TAG_STATE;
        } else if (isLetter(char)) {
          currentBuffer = char.toLowerCase();
          state = ParserState.TAG_NAME_STATE;
        } else {
          // Malformed tag
          nodes.push({ type: "text", content: "<" + char });
          currentBuffer = "";
          state = ParserState.DATA_STATE;
        }
        break;

      case ParserState.TAG_NAME_STATE:
        if (char === ">") {
          // End of opening tag
          nodes.push({ type: "open_tag", content: currentBuffer });
          currentBuffer = "";
          state = ParserState.DATA_STATE;
        } else if (isAlphanumericOrHyphen(char)) {
          currentBuffer += char.toLowerCase();
        } else if (isWhitespace(char)) {
          // Whitespace after tag name - might have attributes
          state = ParserState.ATTRIBUTE_STATE;
          attributeBuffer = "";
        } else {
          // Unexpected character, treat as text
          nodes.push({ type: "text", content: "<" + currentBuffer + char });
          currentBuffer = "";
          state = ParserState.DATA_STATE;
        }
        break;

      case ParserState.ATTRIBUTE_STATE: {
        // Simple attribute parsing - collect everything until '>'
        if (char === ">") {
          // Parse attributes from buffer
          const attributes = parseAttributes(attributeBuffer);
          nodes.push({
            type: "open_tag",
            content: currentBuffer,
            attributes,
          });
          currentBuffer = "";
          attributeBuffer = "";
          state = ParserState.DATA_STATE;
        } else {
          attributeBuffer += char;
        }
        break;
      }

      case ParserState.CLOSE_TAG_STATE:
        if (isLetter(char)) {
          currentBuffer = char.toLowerCase();
          state = ParserState.CLOSE_TAG_NAME_STATE;
        } else if (char === ">") {
          // Empty closing tag like '</>", treat as text
          nodes.push({ type: "text", content: "</>" });
          currentBuffer = "";
          state = ParserState.DATA_STATE;
        } else {
          // Malformed
          nodes.push({ type: "text", content: "</" + char });
          currentBuffer = "";
          state = ParserState.DATA_STATE;
        }
        break;

      case ParserState.CLOSE_TAG_NAME_STATE:
        if (char === ">") {
          nodes.push({ type: "close_tag", content: currentBuffer });
          currentBuffer = "";
          state = ParserState.DATA_STATE;
        } else if (isAlphanumericOrHyphen(char)) {
          currentBuffer += char.toLowerCase();
        } else if (isWhitespace(char)) {
          // Whitespace in closing tag, skip until '>'
          let j = i + 1;
          while (j < html.length && html[j] !== ">") {
            j++;
          }
          if (j < html.length) {
            nodes.push({ type: "close_tag", content: currentBuffer });
            currentBuffer = "";
            i = j;
            state = ParserState.DATA_STATE;
          } else {
            // No closing '>', treat as text
            nodes.push({ type: "text", content: "</" + currentBuffer });
            currentBuffer = "";
            state = ParserState.DATA_STATE;
          }
        } else {
          // Malformed
          nodes.push({ type: "text", content: "</" + currentBuffer + char });
          currentBuffer = "";
          state = ParserState.DATA_STATE;
        }
        break;
    }
  }

  // Handle remaining buffer
  if (currentBuffer.length > 0) {
    if (state === ParserState.DATA_STATE) {
      nodes.push({ type: "text", content: currentBuffer });
    } else {
      // Incomplete tag, treat as text
      nodes.push({ type: "text", content: currentBuffer });
    }
  }

  // Convert nodes to text and entities
  return buildTextAndEntities(nodes);
}

/**
 * Simple attribute parser - no regex
 */
function parseAttributes(attrString: string): Map<string, string> {
  const attributes = new Map<string, string>();
  const trimmed = attrString.trim();
  if (!trimmed) return attributes;

  let i = 0;
  while (i < trimmed.length) {
    // Skip whitespace
    while (i < trimmed.length && isWhitespace(trimmed[i])) {
      i++;
    }
    if (i >= trimmed.length) break;

    // Get attribute name
    let name = "";
    while (i < trimmed.length && isAlphanumericOrHyphen(trimmed[i])) {
      name += trimmed[i].toLowerCase();
      i++;
    }
    if (!name) break;

    // Skip whitespace
    while (i < trimmed.length && isWhitespace(trimmed[i])) {
      i++;
    }

    // Check for '='
    if (i >= trimmed.length || trimmed[i] !== "=") {
      // Boolean attribute
      attributes.set(name, "");
      continue;
    }
    i++; // Skip '='

    // Skip whitespace
    while (i < trimmed.length && isWhitespace(trimmed[i])) {
      i++;
    }

    // Get value
    let value = "";
    if (i < trimmed.length && (trimmed[i] === '"' || trimmed[i] === "'")) {
      const quote = trimmed[i];
      i++; // Skip opening quote
      while (i < trimmed.length && trimmed[i] !== quote) {
        value += trimmed[i];
        i++;
      }
      if (i < trimmed.length) i++; // Skip closing quote
    } else {
      // Unquoted value
      while (i < trimmed.length && !isWhitespace(trimmed[i])) {
        value += trimmed[i];
        i++;
      }
    }

    attributes.set(name, value);
  }

  return attributes;
}

/**
 * Builds text and entities from parsed nodes
 */
function buildTextAndEntities(nodes: ParseNode[]): {
  text: string;
  entities: MessageEntity[];
} {
  let text = "";
  const entities: MessageEntity[] = [];
  const openTags: OpenTag[] = [];

  for (const node of nodes) {
    if (node.type === "text") {
      text += node.content;
    } else if (node.type === "open_tag") {
      const tagName = node.content;

      // Handle special case for <span class="tg-spoiler">
      if (tagName === "span" && node.attributes?.get("class") === "tg-spoiler") {
        openTags.push({
          tagName: "tg-spoiler",
          startOffset: text.length,
          attributes: node.attributes,
        });
      } else if (TAG_TO_ENTITY_TYPE[tagName]) {
        openTags.push({
          tagName,
          startOffset: text.length,
          attributes: node.attributes,
        });
      }
      // Ignore unknown tags
    } else if (node.type === "close_tag") {
      const tagName = node.content;

      // Find matching open tag
      let matchIndex = -1;
      if (tagName === "span") {
        // Find the last tg-spoiler span
        for (let i = openTags.length - 1; i >= 0; i--) {
          if (openTags[i].tagName === "tg-spoiler") {
            matchIndex = i;
            break;
          }
        }
      } else {
        // Find the last matching tag
        for (let i = openTags.length - 1; i >= 0; i--) {
          if (openTags[i].tagName === tagName) {
            matchIndex = i;
            break;
          }
        }
      }

      if (matchIndex !== -1) {
        const openTag = openTags.splice(matchIndex, 1)[0];
        const length = text.length - openTag.startOffset;

        if (length > 0) {
          const entityType = TAG_TO_ENTITY_TYPE[openTag.tagName];
          let entity: MessageEntity;

          // Create entity with specific properties based on type
          if (openTag.tagName === "a" && openTag.attributes?.has("href")) {
            entity = {
              type: entityType,
              offset: openTag.startOffset,
              length,
              url: openTag.attributes.get("href")!,
            } as MessageEntity;
          } else if (openTag.tagName === "pre") {
            const lang = openTag.attributes?.get("language");
            if (lang) {
              entity = {
                type: entityType,
                offset: openTag.startOffset,
                length,
                language: lang,
              } as MessageEntity;
            } else {
              entity = {
                type: entityType,
                offset: openTag.startOffset,
                length,
              } as MessageEntity;
            }
          } else if (openTag.tagName === "tg-emoji") {
            const emojiId = openTag.attributes?.get("emoji-id");
            if (emojiId) {
              entity = {
                type: entityType,
                offset: openTag.startOffset,
                length,
                custom_emoji_id: emojiId,
              } as MessageEntity;
            } else {
              entity = {
                type: entityType,
                offset: openTag.startOffset,
                length,
              } as MessageEntity;
            }
          } else {
            entity = {
              type: entityType,
              offset: openTag.startOffset,
              length,
            } as MessageEntity;
          }

          entities.push(entity);
        }
      }
      // Ignore unmatched closing tags
    }
  }

  // Sort entities by offset, then by length (longer first for same offset)
  entities.sort((a, b) => {
    if (a.offset !== b.offset) {
      return a.offset - b.offset;
    }
    return b.length - a.length;
  });

  return { text, entities };
}
