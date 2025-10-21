import {
  a,
  b,
  blockquote,
  code,
  emoji,
  EntityTag,
  i,
  pre,
  s,
  spoiler,
  u,
} from "./entity-tag.ts";

/**
 * Parser states for the finite state automaton
 */
const STATE = {
  TEXT: "TEXT",
  ESCAPED_TEXT: "ESCAPED_TEXT",
  TAG_OPEN: "TAG_OPEN",
  TAG_NAME: "TAG_NAME",
} as const;

/**
 * Parses HTML string into text and message entities
 * @param html The HTML string to parse
 * @returns Object containing plain text and entities array
 */
export function parseHtml(html: string): {
  textParts: string[];
  entityTagParts: EntityTag[];
} {
  let state: typeof STATE[keyof typeof STATE] = STATE.TEXT;
  let textBuffer = "";
  let escapedBuffer = "";
  let tagContentBuffer = "";
  const textParts: string[] = [];
  const entityTagParts: EntityTag[] = [];

  // Loop through each character
  for (const char of html) {
    switch (state) {
      case STATE.TEXT:
        // We do not immediately flush textBuffer into textParts when changing states
        // as the following char might prove us wrong (i.e. not an actual tag open)
        if (char === "<") {
          state = STATE.TAG_OPEN;
        } else if (char === "&") {
          state = STATE.ESCAPED_TEXT;
        } else {
          textBuffer += char;
        }
        break;

      case STATE.ESCAPED_TEXT:
        if (char === "&") {
          // Seen contents did not lead to an actual escaped char, flush to textBuffer
          textBuffer += `&${escapedBuffer}`;
        } else if (char === ";") {
          switch (escapedBuffer) {
            case "amp":
              textBuffer += "&";
              break;
            case "lt":
              textBuffer += "<";
              break;
            case "gt":
              textBuffer += ">";
              break;
            case "quot":
              textBuffer += `"`;
              break;
            default:
              // Not a known escaped sequence, flush all to textBuffer
              textBuffer += `&${escapedBuffer};`;
              break;
          }
          escapedBuffer = "";
          state = STATE.TEXT;
        } else {
          escapedBuffer += char;
        }
        break;

      case STATE.TAG_OPEN:
        if (char === "<") {
          // Seen contents did not lead to an actual tag, flush to textBuffer
          textBuffer += "<";
        } else if (char === ">") {
          // Seen contents did not lead to an actual tag, flush to textBuffer
          textBuffer += "<>";
          state = STATE.TEXT;
        } else {
          // For any other char, assume valid and lock into building tag content
          tagContentBuffer += char;
          state = STATE.TAG_NAME;
        }
        break;

      case STATE.TAG_NAME:
        if (char === ">") {
          // End of tag, convert tag to EntityTag
          const [tagName, ...tagAttributes] = tagContentBuffer.split(" ");
          const attributeEntries = tagAttributes
            .map((attr) => attr.split("="))
            .map(
              (attrParts) => [
                attrParts[0],
                attrParts.slice(1).join("="),
              ],
            )
            .map((
              [attrName, attrValue],
            ) => [attrName, attrValue.length > 0 ? JSON.parse(attrValue) : ""]);
          const attributes: Record<string, string> = Object.fromEntries(
            attributeEntries,
          );
          let entityTag: EntityTag | undefined;
          switch (tagName) {
            case "b":
            case "/b":
            case "strong":
            case "/strong":
              entityTag = b();
              break;
            case "i":
            case "/i":
            case "em":
            case "/em":
              entityTag = i();
              break;
            case "u":
            case "/u":
            case "ins":
            case "/ins":
              entityTag = u();
              break;
            case "s":
            case "/s":
            case "strike":
            case "/strike":
            case "del":
            case "/del":
              entityTag = s();
              break;
            case "tg-spoiler":
            case "/tg-spoiler":
            case "/span":
              entityTag = spoiler();
              break;
            case "span":
              if (
                !attributes["class"] || attributes["class"] !== "tg-spoiler"
              ) {
                // href attribute is mandatory for <a> tags
                textBuffer += `<${tagContentBuffer}>`;
              } else {
                entityTag = spoiler();
              }
              break;
            case "a":
              if (!attributes["href"]) {
                // href attribute is mandatory for <a> tags
                textBuffer += `<${tagContentBuffer}>`;
              } else {
                entityTag = a(attributes["href"]);
              }
              break;
            case "/a":
              // href attribute is mandatory for </a> tags
              entityTag = a("");
              break;
            case "tg-emoji":
              if (!attributes["emoji-id"]) {
                // href attribute is mandatory for <a> tags
                textBuffer += `<${tagContentBuffer}>`;
              } else {
                entityTag = emoji(attributes["emoji-id"]);
              }
              break;
            case "/tg-emoji":
              entityTag = emoji("");
              break;
            case "code":
            case "/code":
              entityTag = code();
              break;
            case "pre":
            case "/pre":
              // This deviates from Telegram HTML-style spec for now
              entityTag = pre(attributes["language"]);
              break;
            case "blockquote":
            case "/blockquote":
              entityTag = blockquote();
              break;
            default:
              // Not a known or supported tag, treat as plain text
              textBuffer += `<${tagContentBuffer}>`;
              break;
          }
          // Whatever the result is, we are done processing this maybe-tag, so tag content is reset
          tagContentBuffer = "";

          // If it was not a valid tag, then this entire endeavor has just been build textBuffer, so just
          // continue without pushing textParts, as there is no dividing entityTagPart either
          if (entityTag) {
            textParts.push(textBuffer);
            entityTagParts.push(entityTag);
            textBuffer = "";
          }
          state = STATE.TEXT;
        } else {
          tagContentBuffer += char;
        }
        break;
    }
  }

  // Handle remaining buffer
  if (textBuffer.length > 0) {
    textParts.push(textBuffer);
  }

  return { textParts, entityTagParts };
}
