import type { MessageEntity } from "./deps.deno.ts";

/**
 * Represents an entity tag used for formatting text via fmt.
 */
export type EntityTag = Omit<MessageEntity, "offset" | "length">;

/**
 * Objects that implement this interface implement a `.toString()`
 * method that returns a `string` value representing the object.
 */
export interface Stringable {
  /**
   * Returns the string representation of this object
   */
  toString(): string;
}

/**
 * Represents text object with optional formatting entities.
 *
 * This interface is used to store plain text along with its associated
 * formatting information (such as bold, italic, links, etc.) as message entities.
 *
 * @example
 * ```typescript
 * const formattedText: TextWithEntities = {
 *   text: "Hello world!",
 *   entities: [
 *     { type: "bold", offset: 0, length: 5 },
 *     { type: "italic", offset: 6, length: 5 }
 *   ]
 * };
 * ```
 */
export interface TextWithEntities {
  /**
   * Plain text value for this `FormattedString`
   */
  text: string;

  /**
   * Format entities for this `FormattedString`
   */
  entities?: MessageEntity[];
}

/**
 * Represents caption object with optional formatting entities.
 *
 * This interface is used to store plain caption along with its associated
 * formatting information (such as bold, italic, links, etc.) as message entities.
 *
 * @example
 * ```typescript
 * const formattedCaption: CaptionWithEntities = {
 *   caption: "Hello world!",
 *   caption_entities: [
 *     { type: "bold", offset: 0, length: 5 },
 *     { type: "italic", offset: 6, length: 5 }
 *   ]
 * };
 * ```
 */
export interface CaptionWithEntities {
  /**
   * Plain caption value for this `FormattedString`
   */
  caption: string;

  /**
   * Format caption_entities for this `FormattedString`
   */
  caption_entities?: MessageEntity[];
}

/**
 * Represents the formatted string after parsing. This class provides a unified
 * interface for working with formatted text that can be used as both message text
 * and caption content in Telegram Bot API calls.
 */
export class FormattedString
  implements TextWithEntities, CaptionWithEntities, Stringable {
  /**
   * The entities backing this FormattedString.
   */
  rawEntities: MessageEntity[];

  /**
   * Creates a new `FormattedString` instance.
   *
   * @param rawText The plain text content
   * @param rawEntities The formatting entities that apply to the text
   *
   * @example
   * ```typescript
   * const formatted = new FormattedString("Hello world!", [
   *   { type: "bold", offset: 0, length: 5 },
   *   { type: "italic", offset: 6, length: 5 }
   * ]);
   * ```
   */
  constructor(public rawText: string, rawEntities?: MessageEntity[]) {
    this.rawEntities = rawEntities ?? [];
  }

  /**
   * Gets the caption text. This is an alias for the raw text content.
   * Used when this FormattedString is used as caption content.
   */
  get caption() {
    return this.rawText;
  }

  /**
   * Gets the plain text content. This is an alias for the raw text content.
   * Used when this FormattedString is used as message text.
   */
  get text() {
    return this.rawText;
  }

  /**
   * Gets the caption entities. This is an alias for the raw entities.
   * Used when this FormattedString is used as caption content.
   */
  get caption_entities() {
    return this.rawEntities;
  }

  /**
   * Gets the message entities. This is an alias for the raw entities.
   * Used when this FormattedString is used as message text.
   */
  get entities() {
    return this.rawEntities;
  }

  /**
   * Returns the string representation of this `FormattedString` object
   */
  toString() {
    return this.rawText;
  }

  // Static formatting methods
  /**
   * Creates a bold formatted string
   * @param text The text content to format as bold
   * @returns A new FormattedString with bold formatting applied
   */
  static b(text: Stringable) {
    return fmt`${b}${text}${b}`;
  }

  /**
   * Creates a bold formatted string
   * @param text The text content to format as bold
   * @returns A new FormattedString with bold formatting applied
   */
  static bold(text: Stringable) {
    return fmt`${bold}${text}${bold}`;
  }

  /**
   * Creates an italic formatted string
   * @param text The text content to format as italic
   * @returns A new FormattedString with italic formatting applied
   */
  static i(text: Stringable) {
    return fmt`${i}${text}${i}`;
  }

  /**
   * Creates an italic formatted string
   * @param text The text content to format as italic
   * @returns A new FormattedString with italic formatting applied
   */
  static italic(text: Stringable) {
    return fmt`${italic}${text}${italic}`;
  }

  /**
   * Creates a strikethrough formatted string
   * @param text The text content to format with strikethrough
   * @returns A new FormattedString with strikethrough formatting applied
   */
  static s(text: Stringable) {
    return fmt`${s}${text}${s}`;
  }

  /**
   * Creates a strikethrough formatted string
   * @param text The text content to format with strikethrough
   * @returns A new FormattedString with strikethrough formatting applied
   */
  static strikethrough(text: Stringable) {
    return fmt`${strikethrough}${text}${strikethrough}`;
  }

  /**
   * Creates an underline formatted string
   * @param text The text content to format with underline
   * @returns A new FormattedString with underline formatting applied
   */
  static u(text: Stringable) {
    return fmt`${u}${text}${u}`;
  }

  /**
   * Creates an underline formatted string
   * @param text The text content to format with underline
   * @returns A new FormattedString with underline formatting applied
   */
  static underline(text: Stringable) {
    return fmt`${underline}${text}${underline}`;
  }

  /**
   * Creates a link formatted string
   * @param text The text content to display as a link
   * @param url The URL to link to
   * @returns A new FormattedString with link formatting applied
   */
  static a(text: Stringable, url: string) {
    return fmt`${a(url)}${text}${a}`;
  }

  /**
   * Creates a link formatted string
   * @param text The text content to display as a link
   * @param url The URL to link to
   * @returns A new FormattedString with link formatting applied
   */
  static link(text: Stringable, url: string) {
    return fmt`${link(url)}${text}${link}`;
  }

  /**
   * Creates a code formatted string
   * @param text The text content to format as inline code
   * @returns A new FormattedString with code formatting applied
   */
  static code(text: Stringable) {
    return fmt`${code}${text}${code}`;
  }

  /**
   * Creates a pre formatted string (code block)
   * @param text The text content to format as a code block
   * @param language The programming language for syntax highlighting
   * @returns A new FormattedString with pre formatting applied
   */
  static pre(text: Stringable, language: string) {
    return fmt`${pre(language)}${text}${pre}`;
  }

  /**
   * Creates a spoiler formatted string
   * @param text The text content to format as a spoiler
   * @returns A new FormattedString with spoiler formatting applied
   */
  static spoiler(text: Stringable) {
    return fmt`${spoiler}${text}${spoiler}`;
  }

  /**
   * Creates a blockquote formatted string
   * @param text The text content to format as a blockquote
   * @returns A new FormattedString with blockquote formatting applied
   */
  static blockquote(text: Stringable) {
    return fmt`${blockquote}${text}${blockquote}`;
  }

  /**
   * Creates an expandable blockquote formatted string
   * @param text The text content to format as an expandable blockquote
   * @returns A new FormattedString with expandable blockquote formatting applied
   */
  static expandableBlockquote(text: Stringable) {
    return fmt`${expandableBlockquote}${text}${expandableBlockquote}`;
  }

  /**
   * Creates a user mention formatted string
   * @param text The text content to display for the mention
   * @param userId The Telegram user ID to mention
   * @returns A new FormattedString with user mention formatting applied
   */
  static mentionUser(text: Stringable, userId: number) {
    return mentionUser(text, userId);
  }

  /**
   * Creates a custom emoji formatted string
   * @param placeholder The placeholder emoji text to display
   * @param emoji The custom emoji identifier
   * @returns A new FormattedString with custom emoji formatting applied
   */
  static customEmoji(placeholder: Stringable, emoji: string) {
    return customEmoji(placeholder, emoji);
  }

  /**
   * Creates a message link formatted string
   * @param text The text content to display for the link
   * @param chatId The chat ID containing the message
   * @param messageId The message ID to link to
   * @returns A new FormattedString with message link formatting applied
   */
  static linkMessage(text: Stringable, chatId: number, messageId: number) {
    return linkMessage(text, chatId, messageId);
  }

  // Instance formatting methods
  /**
   * Combines this FormattedString with a bold formatted string
   * @param text The text content to format as bold and append
   * @returns A new FormattedString combining this instance with bold formatting
   */
  b(text: Stringable) {
    return fmt`${this}${FormattedString.b(text)}`;
  }

  /**
   * Combines this FormattedString with a bold formatted string
   * @param text The text content to format as bold and append
   * @returns A new FormattedString combining this instance with bold formatting
   */
  bold(text: Stringable) {
    return fmt`${this}${FormattedString.bold(text)}`;
  }

  /**
   * Combines this FormattedString with an italic formatted string
   * @param text The text content to format as italic and append
   * @returns A new FormattedString combining this instance with italic formatting
   */
  i(text: Stringable) {
    return fmt`${this}${FormattedString.i(text)}`;
  }

  /**
   * Combines this FormattedString with an italic formatted string
   * @param text The text content to format as italic and append
   * @returns A new FormattedString combining this instance with italic formatting
   */
  italic(text: Stringable) {
    return fmt`${this}${FormattedString.italic(text)}`;
  }

  /**
   * Combines this FormattedString with a strikethrough formatted string
   * @param text The text content to format with strikethrough and append
   * @returns A new FormattedString combining this instance with strikethrough formatting
   */
  s(text: Stringable) {
    return fmt`${this}${FormattedString.s(text)}`;
  }

  /**
   * Combines this FormattedString with a strikethrough formatted string
   * @param text The text content to format with strikethrough and append
   * @returns A new FormattedString combining this instance with strikethrough formatting
   */
  strikethrough(text: Stringable) {
    return fmt`${this}${FormattedString.strikethrough(text)}`;
  }

  /**
   * Combines this FormattedString with an underline formatted string
   * @param text The text content to format with underline and append
   * @returns A new FormattedString combining this instance with underline formatting
   */
  u(text: Stringable) {
    return fmt`${this}${FormattedString.u(text)}`;
  }

  /**
   * Combines this FormattedString with an underline formatted string
   * @param text The text content to format with underline and append
   * @returns A new FormattedString combining this instance with underline formatting
   */
  underline(text: Stringable) {
    return fmt`${this}${FormattedString.underline(text)}`;
  }

  /**
   * Combines this FormattedString with a link formatted string
   * @param text The text content to display as a link and append
   * @param url The URL to link to
   * @returns A new FormattedString combining this instance with link formatting
   */
  a(text: Stringable, url: string) {
    return fmt`${this}${FormattedString.a(text, url)}`;
  }

  /**
   * Combines this FormattedString with a link formatted string
   * @param text The text content to display as a link and append
   * @param url The URL to link to
   * @returns A new FormattedString combining this instance with link formatting
   */
  link(text: Stringable, url: string) {
    return fmt`${this}${FormattedString.link(text, url)}`;
  }

  /**
   * Combines this FormattedString with a code formatted string
   * @param text The text content to format as inline code and append
   * @returns A new FormattedString combining this instance with code formatting
   */
  code(text: Stringable) {
    return fmt`${this}${FormattedString.code(text)}`;
  }

  /**
   * Combines this FormattedString with a pre formatted string (code block)
   * @param text The text content to format as a code block and append
   * @param language The programming language for syntax highlighting
   * @returns A new FormattedString combining this instance with pre formatting
   */
  pre(text: Stringable, language: string) {
    return fmt`${this}${FormattedString.pre(text, language)}`;
  }

  /**
   * Combines this FormattedString with a spoiler formatted string
   * @param text The text content to format as a spoiler and append
   * @returns A new FormattedString combining this instance with spoiler formatting
   */
  spoiler(text: Stringable) {
    return fmt`${this}${FormattedString.spoiler(text)}`;
  }

  /**
   * Combines this FormattedString with a blockquote formatted string
   * @param text The text content to format as a blockquote and append
   * @returns A new FormattedString combining this instance with blockquote formatting
   */
  blockquote(text: Stringable) {
    return fmt`${this}${FormattedString.blockquote(text)}`;
  }

  /**
   * Combines this FormattedString with an expandable blockquote formatted string
   * @param text The text content to format as an expandable blockquote and append
   * @returns A new FormattedString combining this instance with expandable blockquote formatting
   */
  expandableBlockquote(text: Stringable) {
    return fmt`${this}${FormattedString.expandableBlockquote(text)}`;
  }

  /**
   * Combines this FormattedString with a user mention formatted string
   * @param text The text content to display for the mention and append
   * @param userId The Telegram user ID to mention
   * @returns A new FormattedString combining this instance with user mention formatting
   */
  mentionUser(text: Stringable, userId: number) {
    return fmt`${this}${FormattedString.mentionUser(text, userId)}`;
  }

  /**
   * Combines this FormattedString with a custom emoji formatted string
   * @param placeholder The placeholder emoji text to display and append
   * @param emoji The custom emoji identifier
   * @returns A new FormattedString combining this instance with custom emoji formatting
   */
  customEmoji(placeholder: Stringable, emoji: string) {
    return fmt`${this}${FormattedString.customEmoji(placeholder, emoji)}`;
  }

  /**
   * Combines this FormattedString with a message link formatted string
   * @param text The text content to display for the link and append
   * @param chatId The chat ID containing the message
   * @param messageId The message ID to link to
   * @returns A new FormattedString combining this instance with message link formatting
   */
  linkMessage(text: Stringable, chatId: number, messageId: number) {
    return fmt`${this}${FormattedString.linkMessage(text, chatId, messageId)}`;
  }

  /**
   * Combines this FormattedString with plain text
   * @param text The plain text content to append
   * @returns A new FormattedString combining this instance with the plain text
   */
  plain(text: string) {
    return fmt`${this}${text}`;
  }
}

function buildFormatter<T extends Array<unknown> = never>(
  type: MessageEntity["type"],
  ...formatArgKeys: T
): (...formatArgs: T) => EntityTag {
  return (...formatArgs) => {
    const formatArgObj = Object.fromEntries(
      formatArgKeys.map((formatArgKey, i) => [formatArgKey, formatArgs[i]]),
    );
    return { type, ...formatArgObj };
  };
}

// === Native entity functions
/**
 * Alias for `bold` entity tag. Incompatible with `code` and `pre`.
 */
export function b() {
  return buildFormatter("bold")();
}
/**
 * `bold` entity tag. Incompatible with `code` and `pre`.
 */
export function bold() {
  return buildFormatter("bold")();
}
/**
 * Alias for `italic` entity tag. Incompatible with `code` and `pre`.
 */
export function i() {
  return buildFormatter("italic")();
}
/**
 * `italic` entity tag. Incompatible with `code` and `pre`.
 */
export function italic() {
  return buildFormatter("italic")();
}
/**
 * Alias for `strikethrough` entity tag. Incompatible with `code` and `pre`.
 */
export function s() {
  return buildFormatter("strikethrough")();
}
/**
 * `strikethrough` entity tag. Incompatible with `code` and `pre`.
 */
export function strikethrough() {
  return buildFormatter("strikethrough")();
}
/**
 * Alias for `underline` entity tag. Incompatible with `code` and `pre`.
 */
export function u() {
  return buildFormatter("underline")();
}
/**
 * `underline` entity tag. Incompatible with `code` and `pre`.
 */
export function underline() {
  return buildFormatter("underline")();
}

/**
 * Alias for `link` entity tag. Incompatible with `code` and `pre`.
 * @param url The URL to link to.
 */
export function a(url: string) {
  return buildFormatter<[url: string]>("text_link", "url")(url);
}
/**
 * `link` entity tag. Incompatible with `code` and `pre`.
 * @param url The URL to link to.
 */
export function link(url: string) {
  return buildFormatter<[url: string]>("text_link", "url")(url);
}

/**
 * `code` entity tag. Cannot be combined with any other formats.
 */
export function code() {
  return buildFormatter("code")();
}
/**
 * `pre` entity tag. Cannot be combined with any other formats.
 * @param language The language of the code block.
 */
export function pre(language: string) {
  return buildFormatter<[language: string]>("pre", "language")(language);
}

/**
 * `spoiler` entity tag. Incompatible with `code` and `pre`.
 */
export function spoiler() {
  return buildFormatter("spoiler")();
}

/**
 * `blockquote` entity tag. Cannot be nested.
 */
export function blockquote() {
  return buildFormatter("blockquote")();
}
/**
 * `expandable_blockquote` entity tag. Cannot be nested.
 */
export function expandableBlockquote() {
  return buildFormatter("expandable_blockquote")();
}

// ===  Format tagged template function

/**
 * This is the format tagged template function. It accepts a template literal
 * containing any mix of `Stringable`, `string`, `FormattedString`,
 * `TextWithEntities`, `CaptionWithEntities`, and `EntityTag` values, and constructs
 * a `FormattedString` that represents the combination of all the given values.
 * The constructed `FormattedString` also implements Stringable, TextWithEntities,
 * and CaptionWithEntities, and can be used in further `fmt` tagged templates.
 *
 * Can also be called like regular function and passed an array of `Stringable`s.
 *
 * ```ts
 * // Using return values of fmt in fmt
 * const left = fmt`${b}bolded${b}`;
 * const right = fmt`${u}underlined${u}`;
 *
 * const combined = fmt`${left} ${ctx.msg.text} ${right}`;
 * await ctx.reply(combined.text { entities: combined.entities });
 * ```
 *
 * @param rawStringParts An array of `string` parts found in the tagged template
 * @param entityTagsOrFormattedTextObjects An array of `EntityTag`s, `FormattedString`s,
 * `TextWithEntities`, `CaptionWithEntities`, `Stringable` objects, or nullary functions
 * returning `EntityTag`s found in the tagged template
 * @returns A new FormattedString instance containing the formatted text and entities
 */
export function fmt(
  rawStringParts: TemplateStringsArray,
  ...entityTagsOrFormattedTextObjects: (
    | Stringable
    | TextWithEntities
    | CaptionWithEntities
    | EntityTag
    | (() => EntityTag)
  )[]
) {
  let rawText = "";
  const rawEntities: MessageEntity[] = [];
  const openEntitiesQueue: (EntityTag & { offset: number })[] = [];

  for (let i = 0; i < rawStringParts.length; i++) {
    rawText += rawStringParts[i];
    if (i === rawStringParts.length - 1) {
      break;
    }

    const entityTagOrFormattedTextObject = entityTagsOrFormattedTextObjects[i];
    if (
      typeof entityTagOrFormattedTextObject === "object" &&
      "text" in entityTagOrFormattedTextObject
    ) {
      rawText += entityTagOrFormattedTextObject.text;
      rawEntities.push(
        ...(entityTagOrFormattedTextObject.entities ?? []).map((e) => ({
          ...e,
          offset: rawText.length - entityTagOrFormattedTextObject.text.length +
            e.offset,
        })),
      );
      continue;
    }
    if (
      typeof entityTagOrFormattedTextObject === "object" &&
      "caption" in entityTagOrFormattedTextObject
    ) {
      rawText += entityTagOrFormattedTextObject.caption;
      rawEntities.push(
        ...(entityTagOrFormattedTextObject.caption_entities ?? []).map((e) => ({
          ...e,
          offset: rawText.length -
            entityTagOrFormattedTextObject.caption.length + e.offset,
        })),
      );
      continue;
    }

    let entityTag: EntityTag | undefined;
    if (
      typeof entityTagOrFormattedTextObject === "object" &&
      "type" in entityTagOrFormattedTextObject
    ) {
      entityTag = entityTagOrFormattedTextObject;
    }
    if (typeof entityTagOrFormattedTextObject === "function") {
      entityTag = entityTagOrFormattedTextObject();
    }
    if (entityTag) {
      const matchingEntityIndex = openEntitiesQueue.findIndex((e) =>
        e.type === entityTag.type
      );
      if (matchingEntityIndex === -1) {
        openEntitiesQueue.push({ ...entityTag, offset: rawText.length });
      } else {
        const matchingEntity =
          openEntitiesQueue.splice(matchingEntityIndex, 1)[0];
        rawEntities.push({
          ...matchingEntity,
          length: rawText.length - matchingEntity.offset,
        } as MessageEntity);
      }
      continue;
    }

    rawText += entityTagOrFormattedTextObject.toString();
  }
  rawEntities.push(...openEntitiesQueue.map((e) =>
    ({
      ...e,
      length: rawText.length - e.offset,
    }) as MessageEntity
  ));

  return new FormattedString(rawText, rawEntities);
}

// Utility functions
/**
 * Formats the `Stringable` as an internal Telegram link to a user. Incompatible with `code` and `pre`.
 * @param stringLike The `Stringable` to format.
 * @param userId The user ID to link to.
 */
export function mentionUser(stringLike: Stringable, userId: number) {
  return fmt`${a(`tg://user?id=${userId}`)}${stringLike}${a}`;
}

/**
 * Inserts a custom emoji.
 * @param placeholder A placeholder emoji
 * @param emoji The custom emoji identifier
 */
export function customEmoji(placeholder: Stringable, emoji: string) {
  return fmt`${a(`tg://emoji?id=${emoji}`)}${placeholder}${a}`;
}

/**
 * Formats the `Stringable` as a Telegram link to a chat message. Incompatible with `code` and `pre`.
 * @param stringLike The `Stringable` to format.
 * @param chatId The chat ID to link to.
 * @param messageId The message ID to link to.
 */
export function linkMessage(
  stringLike: Stringable,
  chatId: number,
  messageId: number,
) {
  if (chatId > 0) {
    console.warn(
      "linkMessage can only be used for supergroups and channel messages. Refusing to transform into link.",
    );
    return fmt`${stringLike}`;
  } else if (chatId < -1002147483647 || chatId > -1000000000000) {
    console.warn(
      "linkMessage is not able to link messages whose chatIds are greater than -1000000000000 or less than -1002147483647 at this moment. Refusing to transform into link.",
    );
    return fmt`${stringLike}`;
  } else {
    return fmt`${
      a(`https://t.me/c/${(chatId + 1000000000000) * -1}/${messageId}`)
    }${stringLike}${a}`;
  }
}
