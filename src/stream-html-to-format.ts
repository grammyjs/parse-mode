import type { MessageEntity } from "./deps.deno.ts";
import { FormattedString } from "./format.ts";
import { copyMessageEntity } from "./util.ts";

export const supportedEntities = ["amp", "lt", "gt", "quot"];
export const supportedTags = [
  "b",
  "strong",
  "i",
  "em",
  "u",
  "ins",
  "s",
  "strike",
  "del",
  "span",
  "tg-spoiler",
  "a",
  "tg-emoji",
  "code",
  "pre",
  "blockquote",
];
export const supportedTagsSet: Set<string> = new Set(supportedTags);

export const supportedBareAttributes = ["expandable"];
export const supportedBareAttributesSet = new Set(supportedBareAttributes);
export const supportedValuedAttributes = ["class", "href", "emoji-id"];
export const supportedValuedAttributesSet = new Set(supportedValuedAttributes);
export const supportedAttributes = [
  ...supportedBareAttributes,
  ...supportedValuedAttributes,
];

export const tagsToRequiredAttributes = new Map<string, string[]>([
  ["a", ["href"]],
  ["span", ["class"]],
  ["tg-emoji", ["emoji-id"]],
]);

export const languageClassPrefix = "language-";
export const spoilerClassName = "tg-spoiler";
export const maxCharCode = 65535;

export function isWhitespace(char: string): boolean {
  return char.trim() === "";
}

export function isSupportedTagPrefix(prefix: string): boolean {
  return supportedTags.some((tag) => tag.startsWith(prefix));
}

export function isSupportedAttributePrefix(prefix: string): boolean {
  return supportedAttributes.some((attr) => attr.startsWith(prefix));
}

export function isSupportedEntityPrefix(prefix: string): boolean {
  return supportedEntities.some((entity) => entity.startsWith(prefix));
}

export function isAlphabet(char: string): boolean {
  return (char >= "a" && char <= "z") ||
    (char >= "A" && char <= "Z");
}

export function isDecimalDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

export function isHexDigit(char: string): boolean {
  return isDecimalDigit(char) ||
    (char >= "a" && char <= "f") ||
    (char >= "A" && char <= "F");
}

export function isValidCharCode(charCode: number): boolean {
  return !isNaN(charCode) && charCode >= 0 && charCode <= maxCharCode;
}

const HTML_STREAM_PARSER_MODE = {
  TEXT: "TEXT",
  OPEN_TAG_NAME: "OPEN_TAG_NAME",
  CLOSE_TAG_NAME: "CLOSE_TAG_NAME",
  CLOSE_TAG_SEEK_END: "CLOSE_TAG_SEEK_END",
  ATTR_NAME: "ATTR_NAME",
  ATTR_VALUE_BARE: "ATTR_VALUE_BARE",
  ATTR_VALUE_QUOTED: "ATTR_VALUE_QUOTED",
  HTML_ENTITY: "HTML_ENTITY",
  NUMERIC_ENTITY: "NUMERIC_ENTITY",
  HEX_ENTITY: "HEX_ENTITY",

  // After `<`, we need to decide if this is
  // open tag,
  // close tag, or
  // malformed (i.e. plaintext)
  DECISION_OPEN_TAG_NAME_OR_CLOSE_TAG_NAME:
    "DECISION_OPEN_TAG_NAME_OR_CLOSE_TAG_NAME",
  // After ` ` following open tag name, we need to decide if we should
  // build attr name or
  // end open tag
  DECISION_ATTR_NAME_OR_OPEN_TAG_END: "DECISION_ATTR_NAME_OR_OPEN_TAG_END",
  // After ` ` following attr name, we need to decide if we are
  // building next attr name, or
  // building attr value for this attr, or
  // end open tag
  DECISION_ATTR_VALUE_OR_ATTR_NAME_OR_OPEN_TAG_END:
    "DECISION_ATTR_VALUE_OR_ATTR_NAME_OR_OPEN_TAG_END",
  // After `=` following attr name, we need to decide if we are
  // building bare attr value for this attr, or
  // quoted attr value for this attr
  DECISION_ATTR_VALUE_BARE_OR_ATTR_VALUE_QUOTED:
    "DECISION_ATTR_VALUE_BARE_OR_ATTR_VALUE_QUOTED",
  // After `&`, we need to decide if this is
  // non-numeric html entity (e.g. &ammp;), or
  // numeric decimal entity (e.g. &#123;), or
  // numeric hexadecimal entity (e.g. (&#x3a;))
  DECISION_HTML_ENTITY_OR_NUMERIC_ENTITY_OR_HEX_ENTITY:
    "DECISION_HTML_ENTITY_OR_NUMERIC_ENTITY_OR_HEX_ENTITY",
  // After `#` following `&`, we need to decide if this is
  // numeric decimal entity (e.g. &#123;), or
  // numeric hexadecimal entity (e.g. (&#x3a;))
  DECISION_NUMERIC_ENTITY_OR_HEX_ENTITY:
    "DECISION_NUMERIC_ENTITY_OR_HEX_ENTITY",
} as const;

type HTMLTagDraft = {
  name: string;
  isClosing: boolean;
  offset: number;
  originalText: string;
  attrs: Map<string, string>;
};

/**
 * Parses a stream of HTML-style Telegram Bot API characters and generates a FormattedString.
 * @see https://core.telegram.org/bots/api#html-style
 */
export class HTMLStreamParser {
  private mode: keyof typeof HTML_STREAM_PARSER_MODE =
    HTML_STREAM_PARSER_MODE.TEXT;

  private text: string = "";
  private entities: MessageEntity[] = [];

  // This represents the original text of
  // an entire HTML tag (e.g. `<blockquote expandable>`), or
  // an entire HTML entity (e.g. `&#x3A;`)
  private fullTagOrEntityBufferText: string = "";
  // This represents the post-processed text of the entity/tag being worked on in the current mode
  private workingBufferText: string = "";

  // This represent the current attribute that is being worked on
  // e.g. when working buffer is used for attribute value
  private workingAttributeName: string = "";
  private attributeValueQuoteChar: string | undefined = undefined;

  private workingTag: HTMLTagDraft | undefined = undefined;

  // We use a Map of HTMLTagDraft stacks so that we can retrieve the last matching open tag quickly
  private tagStacks: Map<string, HTMLTagDraft[]> = new Map(
    supportedTags.map((tag) => [tag, []]),
  );

  private resetWorkState(): void {
    this.fullTagOrEntityBufferText = "";
    this.workingBufferText = "";
    this.workingAttributeName = "";
    this.attributeValueQuoteChar = undefined;
    this.workingTag = undefined;
    this.mode = HTML_STREAM_PARSER_MODE.TEXT;
  }

  private tokenizeByWhitespace(value: string): string[] {
    const tokens: string[] = [];
    let token = "";
    for (const char of value) {
      if (isWhitespace(char)) {
        if (token !== "") {
          tokens.push(token);
          token = "";
        }
      } else {
        token += char;
      }
    }
    if (token !== "") {
      tokens.push(token);
    }
    return tokens;
  }

  private hasClass(classValue: string, targetClass: string): boolean {
    for (const token of this.tokenizeByWhitespace(classValue)) {
      if (token === targetClass) {
        return true;
      }
    }
    return false;
  }

  private extractLanguageFromCodeClass(classValue: string): string | undefined {
    for (const token of this.tokenizeByWhitespace(classValue)) {
      if (
        token.startsWith(languageClassPrefix) &&
        token.length > languageClassPrefix.length
      ) {
        return token.slice(languageClassPrefix.length);
      }
    }
    return undefined;
  }

  private setBareAttribute(attrName: string): void {
    return this.setValuedAttribute(attrName, "true");
  }

  private setValuedAttribute(attrName: string, attrValue: string): void {
    // This case should never hold true unless there is a logic bug
    if (!this.workingTag) {
      throw new Error(
        `No working tag in ${HTML_STREAM_PARSER_MODE.DECISION_ATTR_NAME_OR_OPEN_TAG_END} mode`,
      );
    }

    if (!this.workingTag.attrs.has(attrName)) {
      this.workingTag.attrs.set(attrName, attrValue);
    }
  }

  private isValidOpenTagFromHTMLTagDraft(workingTag: HTMLTagDraft): boolean {
    // TODO: this is typically duplicate check as we tend to flush to text
    // if tag name is invalid, but we will keep it here for now
    if (!supportedTagsSet.has(workingTag.name)) {
      return false;
    }

    for (
      const requiredAttr of tagsToRequiredAttributes.get(workingTag.name) ?? []
    ) {
      if (!workingTag.attrs.has(requiredAttr)) {
        return false;
      }
    }

    if (workingTag.name === "span") {
      const classValue = workingTag.attrs.get("class");
      if (!classValue || !this.hasClass(classValue, spoilerClassName)) {
        return false;
      }
    }

    return true;
  }

  private buildEntityFromOpenTag(
    openTag: HTMLTagDraft,
  ): MessageEntity | undefined {
    const length = this.text.length - openTag.offset;
    if (length < 0) {
      return undefined;
    }

    switch (openTag.name) {
      case "b":
      case "strong":
        return { type: "bold", offset: openTag.offset, length };
      case "i":
      case "em":
        return { type: "italic", offset: openTag.offset, length };
      case "u":
      case "ins":
        return { type: "underline", offset: openTag.offset, length };
      case "s":
      case "strike":
      case "del":
        return { type: "strikethrough", offset: openTag.offset, length };
      case "span":
      case "tg-spoiler":
        return { type: "spoiler", offset: openTag.offset, length };
      case "a": {
        const url = openTag.attrs.get("href");
        if (!url) {
          return undefined;
        }
        return { type: "text_link", offset: openTag.offset, length, url };
      }
      case "tg-emoji": {
        const customEmojiId = openTag.attrs.get("emoji-id");
        if (!customEmojiId) {
          return undefined;
        }
        return {
          type: "custom_emoji",
          offset: openTag.offset,
          length,
          custom_emoji_id: customEmojiId,
        };
      }
      case "code": {
        const classValue = openTag.attrs.get("class");
        const language = classValue
          ? this.extractLanguageFromCodeClass(classValue)
          : undefined;
        if (language) {
          const preStack = this.tagStacks.get("pre");
          const openPreTag = preStack && preStack.length > 0
            ? preStack[preStack.length - 1]
            : undefined;
          if (openPreTag && openPreTag.offset <= openTag.offset) {
            openPreTag.attrs.set("language", language);
            return undefined;
          }
        }
        return { type: "code", offset: openTag.offset, length };
      }
      case "pre": {
        const language = openTag.attrs.get("language");
        if (language) {
          return { type: "pre", offset: openTag.offset, length, language };
        }
        return { type: "pre", offset: openTag.offset, length };
      }
      case "blockquote":
        if (openTag.attrs.has("expandable")) {
          return {
            type: "expandable_blockquote",
            offset: openTag.offset,
            length,
          };
        }
        return { type: "blockquote", offset: openTag.offset, length };
      default:
        return undefined;
    }
  }

  private addCharInAttributeNameMode(char: string): void {
    this.fullTagOrEntityBufferText += char;

    // This case should never hold true unless there is a logic bug
    if (!this.workingTag) {
      throw new Error(
        `No working tag in ${HTML_STREAM_PARSER_MODE.ATTR_NAME} mode`,
      );
    }
    this.workingTag.originalText = this.fullTagOrEntityBufferText;

    // If `>`, then we are done with attribute names, and the opening tag has ended
    if (char === ">") {
      this.setBareAttribute(this.workingBufferText);
      const isValidOpenTag = this.isValidOpenTagFromHTMLTagDraft(
        this.workingTag,
      );
      if (isValidOpenTag) {
        this.tagStacks.get(this.workingTag.name)?.push(this.workingTag);
      } else {
        this.text += this.fullTagOrEntityBufferText;
      }
      this.resetWorkState();
      return;
    }

    // If `=`, then we are done with attribute name, and
    // must now decide if bare or quoted attr value
    if (char === "=") {
      this.workingAttributeName = this.workingBufferText;
      this.workingBufferText = "";
      this.attributeValueQuoteChar = undefined;
      this.mode =
        HTML_STREAM_PARSER_MODE.DECISION_ATTR_VALUE_BARE_OR_ATTR_VALUE_QUOTED;
      return;
    }

    // If whitespace, we are done with the current attribute name, and
    // must now decide if building next attr name, or attr value, or ending opening tag
    if (isWhitespace(char)) {
      this.workingAttributeName = this.workingBufferText;
      this.workingBufferText = "";
      this.attributeValueQuoteChar = undefined;
      this.mode = HTML_STREAM_PARSER_MODE
        .DECISION_ATTR_VALUE_OR_ATTR_NAME_OR_OPEN_TAG_END;
      return;
    }

    // If neither `>` nor `=` nor whitespace, we are still building attr name
    // which is case-insensitive
    this.workingBufferText += char.toLowerCase();
  }

  private addCharInAttrValueBareMode(char: string): void {
    this.fullTagOrEntityBufferText += char;

    // This case should never hold true unless there is a logic bug
    if (!this.workingTag) {
      throw new Error(
        `No working tag in ${HTML_STREAM_PARSER_MODE.ATTR_VALUE_BARE} mode`,
      );
    }
    this.workingTag.originalText = this.fullTagOrEntityBufferText;

    // If `>` or whitespace in bare mode, we are done building attr value
    const isWhitespaceChar = isWhitespace(char);
    if (char === ">" || isWhitespaceChar) {
      // Only respect the first seen attr value for the attr name
      const attrValue = this.workingTag.attrs.get(this.workingAttributeName) ??
        this.workingBufferText;
      this.workingTag.attrs.set(this.workingAttributeName, attrValue);

      // We can clear attribute related buffers now that we have completed a attr name-value pair
      this.workingAttributeName = "";
      this.workingBufferText = "";
    }

    // If `>` in bare mode, we are now ending opening tag, so just add to stack of working tags if valid
    if (char === ">") {
      const isValidOpenTag = this.isValidOpenTagFromHTMLTagDraft(
        this.workingTag,
      );
      if (isValidOpenTag) {
        this.tagStacks.get(this.workingTag.name)?.push(this.workingTag);
      } else {
        this.text += this.fullTagOrEntityBufferText;
      }
      this.resetWorkState();
      return;
    }

    // If whitespace in bare mode, we must decide if building next attr name or ending opening tag
    if (isWhitespace(char)) {
      this.mode = HTML_STREAM_PARSER_MODE.DECISION_ATTR_NAME_OR_OPEN_TAG_END;
      return;
    }

    // If neither `>` nor whitespace, we leniently assume that it is part of bare attr value
    this.workingBufferText += char;
  }

  private addCharInAttrValueQuotedMode(char: string): void {
    this.fullTagOrEntityBufferText += char;

    // This case should never hold true unless there is a logic bug
    if (!this.workingTag) {
      throw new Error(
        `No working tag in ${HTML_STREAM_PARSER_MODE.ATTR_VALUE_QUOTED} mode`,
      );
    }
    this.workingTag.originalText = this.fullTagOrEntityBufferText;

    // The only way to end a quoted attr value is to provide the matching quote char
    // After completing attr value, we must decide if building next attr name or ending opening tag
    if (char === this.attributeValueQuoteChar) {
      // Only respect the first seen attr value for the attr name
      const attrValue = this.workingTag.attrs.get(this.workingAttributeName) ??
        this.workingBufferText;
      this.workingTag.attrs.set(this.workingAttributeName, attrValue);

      // We can clear attribute related buffers now that we have completed a attr name-value pair
      this.workingAttributeName = "";
      this.workingBufferText = "";

      this.mode = HTML_STREAM_PARSER_MODE.DECISION_ATTR_NAME_OR_OPEN_TAG_END;
      return;
    }

    // All other characters are assumed to be part of the attr value
    this.workingBufferText += char;
  }

  private addCharInCloseTagNameMode(char: string): void {
    // If we encounter another `<`, the current partial close tag was plain text.
    // Flush it and restart tag detection with this new `<`.
    if (char === "<") {
      this.text += this.fullTagOrEntityBufferText;
      this.fullTagOrEntityBufferText = char;
      this.workingBufferText = "";
      this.mode =
        HTML_STREAM_PARSER_MODE.DECISION_OPEN_TAG_NAME_OR_CLOSE_TAG_NAME;
      return;
    }

    this.fullTagOrEntityBufferText += char;

    const isWhitespaceChar = isWhitespace(char);

    // If not whitespace or `>`, then it is part of tag name
    // Flush early if it is not a prefix of any supported tag names
    if (!isWhitespaceChar && char !== ">") {
      this.workingBufferText += char.toLowerCase();
      if (!isSupportedTagPrefix(this.workingBufferText)) {
        this.text += this.fullTagOrEntityBufferText;
        this.resetWorkState();
      }
      return;
    }

    // Since it is whitespace or `>`, the tag name building is complete
    // If not a valid complete tag name, flush early
    const tagName = this.workingBufferText;
    if (!supportedTagsSet.has(tagName)) {
      this.text += this.fullTagOrEntityBufferText;
      this.resetWorkState();
      return;
    }

    this.workingTag = {
      name: this.workingBufferText,
      isClosing: true,
      offset: this.text.length,
      originalText: this.fullTagOrEntityBufferText,
      attrs: new Map<string, string>(),
    };
    this.workingBufferText = "";

    // We are done building closing tag name, and will skip chars until we see `>`
    // to complete closing tag
    if (isWhitespaceChar) {
      this.mode = HTML_STREAM_PARSER_MODE.CLOSE_TAG_SEEK_END;
      return;
    }

    // If `>`, then we are ending this opening tag, so just add to stack of working tags if valid
    const lastMatchingOpenTag = this.tagStacks.get(this.workingTag.name)?.pop();
    if (lastMatchingOpenTag) {
      const entity = this.buildEntityFromOpenTag(lastMatchingOpenTag);
      if (entity) {
        this.entities.push(entity);
      }
    } else {
      this.text += this.fullTagOrEntityBufferText;
    }
    this.resetWorkState();
  }

  private addCharInCloseTagSeekEndMode(char: string): void {
    this.fullTagOrEntityBufferText += char;

    // This case should never hold true unless there is a logic bug
    if (!this.workingTag) {
      throw new Error(
        `No working tag in ${HTML_STREAM_PARSER_MODE.CLOSE_TAG_SEEK_END} mode`,
      );
    }
    this.workingTag.originalText = this.fullTagOrEntityBufferText;

    // If not `>`, nothing to do but to continue seeking
    if (char !== ">") {
      return;
    }

    // If `>`, then we are ending this opening tag, so just add to stack of working tags if valid
    const lastMatchingOpenTag = this.tagStacks.get(this.workingTag.name)?.pop();
    if (lastMatchingOpenTag) {
      const entity = this.buildEntityFromOpenTag(lastMatchingOpenTag);
      if (entity) {
        this.entities.push(entity);
      }
    } else {
      this.text += this.fullTagOrEntityBufferText;
    }
    this.resetWorkState();
  }

  private addCharInOpenTagNameMode(char: string): void {
    // If we encounter another `<`, the current partial open tag was plain text.
    // Flush it and restart tag detection with this new `<`.
    if (char === "<") {
      this.text += this.fullTagOrEntityBufferText;
      this.fullTagOrEntityBufferText = char;
      this.workingBufferText = "";
      this.mode =
        HTML_STREAM_PARSER_MODE.DECISION_OPEN_TAG_NAME_OR_CLOSE_TAG_NAME;
      return;
    }

    this.fullTagOrEntityBufferText += char;

    const isWhitespaceChar = isWhitespace(char);

    // If not whitespace or `>`, then it is part of tag name
    // Flush early if it is not a prefix of any supported tag names
    if (!isWhitespaceChar && char !== ">") {
      this.workingBufferText += char.toLowerCase();
      if (!isSupportedTagPrefix(this.workingBufferText)) {
        this.text += this.fullTagOrEntityBufferText;
        this.resetWorkState();
      }
      return;
    }

    // Since it is whitespace or `>`, the tag name building is complete
    // If not a valid complete tag name, flush early
    const tagName = this.workingBufferText;
    if (!supportedTagsSet.has(tagName)) {
      this.text += this.fullTagOrEntityBufferText;
      this.resetWorkState();
      return;
    }

    this.workingTag = {
      name: this.workingBufferText,
      isClosing: false,
      offset: this.text.length,
      originalText: this.fullTagOrEntityBufferText,
      attrs: new Map<string, string>(),
    };
    this.workingBufferText = "";

    // If whitespace, then it might either lead to a `>` to end this tag, or
    // the start of an attribute name
    if (isWhitespaceChar) {
      this.mode = HTML_STREAM_PARSER_MODE.DECISION_ATTR_NAME_OR_OPEN_TAG_END;
      return;
    }

    // If `>`, then we are ending this opening tag, so just add to stack of working tags if valid
    const isValidOpenTag = this.isValidOpenTagFromHTMLTagDraft(this.workingTag);
    if (isValidOpenTag) {
      this.tagStacks.get(this.workingTag.name)?.push(this.workingTag);
    } else {
      this.text += this.fullTagOrEntityBufferText;
    }
    this.resetWorkState();
  }

  private addCharInTextMode(char: string): void {
    if (char === "<") {
      this.fullTagOrEntityBufferText = char;
      this.workingBufferText = "";
      this.mode =
        HTML_STREAM_PARSER_MODE.DECISION_OPEN_TAG_NAME_OR_CLOSE_TAG_NAME;
      return;
    }

    if (char === "&") {
      this.fullTagOrEntityBufferText = char;
      this.workingBufferText = "";
      this.mode = HTML_STREAM_PARSER_MODE
        .DECISION_HTML_ENTITY_OR_NUMERIC_ENTITY_OR_HEX_ENTITY;
      return;
    }

    this.text += char;
  }

  private addCharInHtmlEntityMode(char: string): void {
    this.fullTagOrEntityBufferText += char;

    if (char === ";") {
      switch (this.workingBufferText) {
        case "amp":
          this.text += "&";
          break;
        case "lt":
          this.text += "<";
          break;
        case "gt":
          this.text += ">";
          break;
        case "quot":
          this.text += '"';
          break;
        default:
          this.text += this.fullTagOrEntityBufferText;
      }
      this.resetWorkState();
      return;
    }

    // Note: HTML entities are case sensitive
    // i.e. &amp; is valid but &AMP; is not
    this.workingBufferText += char;
    if (!isSupportedEntityPrefix(this.workingBufferText)) {
      this.text += this.fullTagOrEntityBufferText;
      this.resetWorkState();
      return;
    }
  }

  private addCharInNumericEntityMode(char: string): void {
    this.fullTagOrEntityBufferText += char;

    if (char === ";") {
      const charCode = Number(this.workingBufferText);
      if (isValidCharCode(charCode)) {
        this.text += String.fromCharCode(charCode);
      } else {
        this.text += this.fullTagOrEntityBufferText;
      }
      this.resetWorkState();
      this.mode = HTML_STREAM_PARSER_MODE.TEXT;
      return;
    }

    // Decimal numeric entities are case-insensitive, but
    // this means nothing for decimal digits
    this.workingBufferText += char;
    if (!isDecimalDigit(char)) {
      this.text += this.fullTagOrEntityBufferText;
      this.resetWorkState();
      return;
    }
  }

  private addCharInHexEntityMode(char: string): void {
    this.fullTagOrEntityBufferText += char;

    if (char === ";") {
      const charCode = Number(`0x${this.workingBufferText}`);
      if (isValidCharCode(charCode)) {
        this.text += String.fromCharCode(charCode);
      } else {
        this.text += this.fullTagOrEntityBufferText;
      }
      this.resetWorkState();
      this.mode = HTML_STREAM_PARSER_MODE.TEXT;
      return;
    }

    // Hexadecimal entities are case-insensitive, so we standardise
    // working buffer to only contain lowercased hex characters
    this.workingBufferText += char.toLowerCase();
    if (!isHexDigit(char)) {
      this.text += this.fullTagOrEntityBufferText;
      this.resetWorkState();
      return;
    }
  }

  private addCharInDecisionOpenTagNameOrCloseTagNameMode(char: string): void {
    // If we encounter another `<`, the previous `<` was plain text.
    // Flush it and restart tag detection with this new `<`.
    if (char === "<") {
      this.text += this.fullTagOrEntityBufferText;
      this.fullTagOrEntityBufferText = char;
      this.workingBufferText = "";
      return;
    }

    this.fullTagOrEntityBufferText += char;

    if (char === "/") {
      this.mode = HTML_STREAM_PARSER_MODE.CLOSE_TAG_NAME;
      return;
    }

    // If first character is not `/`, then we are adding tag names
    // which are case-insensitive
    this.workingBufferText = char.toLowerCase();
    if (!isSupportedTagPrefix(this.workingBufferText)) {
      this.text += this.fullTagOrEntityBufferText;
      this.resetWorkState();
      return;
    }

    this.mode = HTML_STREAM_PARSER_MODE.OPEN_TAG_NAME;
  }

  private addCharInDecisionAttrNameOrOpenTagEndMode(char: string): void {
    this.fullTagOrEntityBufferText += char;

    // This case should never hold true unless there is a logic bug
    if (!this.workingTag) {
      throw new Error(
        `No working tag in ${HTML_STREAM_PARSER_MODE.DECISION_ATTR_NAME_OR_OPEN_TAG_END} mode`,
      );
    }
    this.workingTag.originalText = this.fullTagOrEntityBufferText;

    // If whitespace, no decision has been made yet, just continue
    if (isWhitespace(char)) {
      return;
    }

    // If `>`, then we have reach the end of this opening tag, so
    // just add to stack of working tags if valid
    if (char === ">") {
      const isValidOpenTag = this.isValidOpenTagFromHTMLTagDraft(
        this.workingTag,
      );
      if (isValidOpenTag) {
        this.tagStacks.get(this.workingTag.name)?.push(this.workingTag);
      } else {
        this.text += this.fullTagOrEntityBufferText;
      }
      this.resetWorkState();
      return;
    }

    // Else, we are starting a new attribute name
    this.workingBufferText = char.toLowerCase();
    this.mode = HTML_STREAM_PARSER_MODE.ATTR_NAME;
  }

  private addCharInDecisionAttrValueOrAttrNameOrOpenTagEndMode(
    char: string,
  ): void {
    this.fullTagOrEntityBufferText += char;

    // This case should never hold true unless there is a logic bug
    if (!this.workingTag) {
      throw new Error(
        `No working tag in ${HTML_STREAM_PARSER_MODE.DECISION_ATTR_VALUE_OR_ATTR_NAME_OR_OPEN_TAG_END} mode`,
      );
    }
    this.workingTag.originalText = this.fullTagOrEntityBufferText;

    // If whitespace, no decision has been made yet, just continue
    if (isWhitespace(char)) {
      return;
    }

    // If `=`, then we want to start building attr value, and
    // must decide if bare or quoted
    if (char === "=") {
      this.mode =
        HTML_STREAM_PARSER_MODE.DECISION_ATTR_VALUE_BARE_OR_ATTR_VALUE_QUOTED;
      return;
    }

    // If `>`, then we have reach the end of this opening tag, so
    // we use attr name as bare attr, and
    // just add to stack of working tags if valid
    if (char === ">") {
      this.setBareAttribute(this.workingAttributeName);

      const isValidOpenTag = this.isValidOpenTagFromHTMLTagDraft(
        this.workingTag,
      );
      if (isValidOpenTag) {
        this.tagStacks.get(this.workingTag.name)?.push(this.workingTag);
      } else {
        this.text += this.fullTagOrEntityBufferText;
      }
      this.resetWorkState();
      return;
    }

    // Else, we are starting a new attribute name.
    // Commit the previous attribute name as a bare attribute first.
    this.setBareAttribute(this.workingAttributeName);
    this.workingAttributeName = "";
    this.workingBufferText = char.toLowerCase();
    this.mode = HTML_STREAM_PARSER_MODE.ATTR_NAME;
  }

  private addCharInDecisionAttrValueBareOrAttrValueQuotedMode(
    char: string,
  ): void {
    this.fullTagOrEntityBufferText += char;

    // This case should never hold true unless there is a logic bug
    if (!this.workingTag) {
      throw new Error(
        `No working tag in ${HTML_STREAM_PARSER_MODE.DECISION_ATTR_VALUE_BARE_OR_ATTR_VALUE_QUOTED} mode`,
      );
    }
    this.workingTag.originalText = this.fullTagOrEntityBufferText;

    // If whitespace, no decision made yet
    if (isWhitespace(char)) {
      return;
    }

    // If char is `'` or `"`, then we are building a quoted attr value
    if (char === `'` || char === `"`) {
      this.attributeValueQuoteChar = char;
      this.mode = HTML_STREAM_PARSER_MODE.ATTR_VALUE_QUOTED;
      return;
    }

    // For any other characters, we leniently assume it is a valid bare attr value
    this.workingBufferText = char;
    this.mode = HTML_STREAM_PARSER_MODE.ATTR_VALUE_BARE;
  }

  private addCharInDecisionHtmlEntityOrNumericEntityOrHexEntityMode(
    char: string,
  ): void {
    this.fullTagOrEntityBufferText += char;

    if (char === "#") {
      this.mode = HTML_STREAM_PARSER_MODE.DECISION_NUMERIC_ENTITY_OR_HEX_ENTITY;
      return;
    }

    // If first character is not `#`, then none of the numerical entities
    // Note: non-numeric entities are case-sensitive
    this.workingBufferText += char;
    if (!isSupportedEntityPrefix(this.workingBufferText)) {
      this.text += this.fullTagOrEntityBufferText;
      this.resetWorkState();
      return;
    }

    this.mode = HTML_STREAM_PARSER_MODE.HTML_ENTITY;
  }

  private addCharInDecisionNumericEntityOrHexEntityMode(char: string): void {
    this.fullTagOrEntityBufferText += char;

    if (char === "x" || char === "X") {
      this.mode = HTML_STREAM_PARSER_MODE.HEX_ENTITY;
      return;
    }

    // If first character is not `x` or `X`, then this is a regular decimal numeric
    // entity, which is case-insensitive but irrelevant for decimal digits
    this.workingBufferText += char;
    if (!isDecimalDigit(char)) {
      this.text += this.fullTagOrEntityBufferText;
      this.resetWorkState();
      return;
    }

    this.mode = HTML_STREAM_PARSER_MODE.NUMERIC_ENTITY;
  }

  /**
   * Add a chunk of HTML text to the parser.
   *
   * @param text - A string containing HTML-formatted text
   */
  add(text: string): void {
    for (const char of text) {
      switch (this.mode) {
        case HTML_STREAM_PARSER_MODE.TEXT:
          this.addCharInTextMode(char);
          break;
        case HTML_STREAM_PARSER_MODE.OPEN_TAG_NAME:
          this.addCharInOpenTagNameMode(char);
          break;
        case HTML_STREAM_PARSER_MODE.CLOSE_TAG_NAME:
          this.addCharInCloseTagNameMode(char);
          break;
        case HTML_STREAM_PARSER_MODE.CLOSE_TAG_SEEK_END:
          this.addCharInCloseTagSeekEndMode(char);
          break;
        case HTML_STREAM_PARSER_MODE.ATTR_NAME:
          this.addCharInAttributeNameMode(char);
          break;
        case HTML_STREAM_PARSER_MODE.ATTR_VALUE_BARE:
          this.addCharInAttrValueBareMode(char);
          break;
        case HTML_STREAM_PARSER_MODE.ATTR_VALUE_QUOTED:
          this.addCharInAttrValueQuotedMode(char);
          break;
        case HTML_STREAM_PARSER_MODE.HTML_ENTITY:
          this.addCharInHtmlEntityMode(char);
          break;
        case HTML_STREAM_PARSER_MODE.NUMERIC_ENTITY:
          this.addCharInNumericEntityMode(char);
          break;
        case HTML_STREAM_PARSER_MODE.HEX_ENTITY:
          this.addCharInHexEntityMode(char);
          break;
        case HTML_STREAM_PARSER_MODE.DECISION_OPEN_TAG_NAME_OR_CLOSE_TAG_NAME:
          this.addCharInDecisionOpenTagNameOrCloseTagNameMode(char);
          break;
        case HTML_STREAM_PARSER_MODE.DECISION_ATTR_NAME_OR_OPEN_TAG_END:
          this.addCharInDecisionAttrNameOrOpenTagEndMode(char);
          break;
        case HTML_STREAM_PARSER_MODE
          .DECISION_ATTR_VALUE_OR_ATTR_NAME_OR_OPEN_TAG_END:
          this.addCharInDecisionAttrValueOrAttrNameOrOpenTagEndMode(char);
          break;
        case HTML_STREAM_PARSER_MODE
          .DECISION_ATTR_VALUE_BARE_OR_ATTR_VALUE_QUOTED:
          this.addCharInDecisionAttrValueBareOrAttrValueQuotedMode(char);
          break;
        case HTML_STREAM_PARSER_MODE
          .DECISION_HTML_ENTITY_OR_NUMERIC_ENTITY_OR_HEX_ENTITY:
          this.addCharInDecisionHtmlEntityOrNumericEntityOrHexEntityMode(char);
          break;
        case HTML_STREAM_PARSER_MODE.DECISION_NUMERIC_ENTITY_OR_HEX_ENTITY:
          this.addCharInDecisionNumericEntityOrHexEntityMode(char);
          break;
        default:
          throw new Error(`Unhandled mode: ${this.mode}`);
      }
    }
  }

  /**
   * Build and return a FormattedString from the accumulated text and entities.
   *
   * @returns A new FormattedString instance containing the parsed text and entities
   */
  toFormattedString(): FormattedString {
    const copyEntities = this.entities.map(copyMessageEntity);
    return new FormattedString(this.text, copyEntities);
  }
}
