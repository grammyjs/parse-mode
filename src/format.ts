import type { MessageEntity } from "./deps.deno.ts";

/**
 * Represents a string that can be formatted with Telegram entities.
 */
export interface Stringable {
  toString(): string;
}

/**
 * Represents the formatted string after the parsing.
 */
class FormattedString implements Stringable {
  text: string;
  entities: MessageEntity[];

  /**
   * Creates a new FormattedString.
   * @param text The text of the string.
   * @param entities The entities of the message.
   */
  constructor(text: string, entities: MessageEntity[]) {
    this.text = text;
    this.entities = entities;
  }

  toString() {
    return this.text;
  }
}

/**
 * Unwraps a normal string into a FormattedString with no entities
 * @param stringLike The string to unwrap
 * @returns A new formatted string instance with no entities
 */
const unwrap = (stringLike: Stringable): FormattedString => {
  if (stringLike instanceof FormattedString) {
    return stringLike;
  }
  return new FormattedString(stringLike.toString(), []);
};

const buildFormatter = <T extends Array<any> = never>(
  type: MessageEntity["type"],
  ...formatArgKeys: T
) => {
  return (stringLike: Stringable, ...formatArgs: T) => {
    const formattedString = unwrap(stringLike);
    const formatArgObj = Object.fromEntries(
      formatArgKeys.map((formatArgKey, i) => [formatArgKey, formatArgs[i]]),
    );
    return new FormattedString(
      formattedString.text,
      [{
        type,
        offset: 0,
        length: formattedString.text.length,
        ...formatArgObj,
      }, ...formattedString.entities],
    );
  };
};

// Native entity functions
/**
 * Formats the string as bold.
 * @param stringLike The string to format.
 */
const bold = buildFormatter("bold");
/**
 * Formats the string as inline code.
 * @param stringLike The string to format.
 */
const code = buildFormatter("code");
/**
 * Formats the string as italic.
 * @param stringLike The string to format.
 */
const italic = buildFormatter("italic");
/**
 * Formats the string as a link.
 * @param stringLike The string to format.
 * @param url The URL to link to.
 */
const link = buildFormatter<[string]>("text_link", "url");
/**
 * Formats the string as a code block
 * @param stringLike The string to format.
 * @param language The language of the code block.
 */
const pre = buildFormatter<[string]>("pre", "language");
/**
 * Formats the string as a spoiler.
 * @param stringLike The string to format.
 */
const spoiler = buildFormatter("spoiler");
/**
 * Formats the string as a strikethrough.
 * @param stringLike The string to format.
 */
const strikethrough = buildFormatter("strikethrough");
/**
 * Formats the string as a underline
 * @param stringLike The string to format.
 */
const underline = buildFormatter("underline");

// Utility functions

/**
 * Formats the string as an internal Telegram link to a user.
 * @param stringLike The string to format.
 * @param userId The user ID to link to.
 */
const mentionUser = (stringLike: Stringable, userId: number) => {
  return link(stringLike, `tg://user?id=${userId}`);
};

/**
 * Formats the string as a Telegram link to a chat message.
 * @param stringLike The string to format.
 * @param chatId The chat ID to link to.
 * @param messageId The message ID to link to.
 */
const linkMessage = (stringLike: Stringable, chatId: number, messageId: number) => {
  if (chatId > 0) {
    console.warn("linkMessage can only be used for supergroups and channel messages. Refusing to transform into link.");
    return stringLike;
  } else if (chatId < -1002147483647 || chatId > -1000000000000) {
    console.warn("linkMessage is not able to link messages whose chatIds are greater than -1000000000000 or less than -1002147483647 at this moment. Refusing to transform into link.");
    return stringLike;
  } else {
    return link(stringLike, `https://t.me/c/${(chatId + 1000000000000) * -1}/${messageId}`);
  }
};

// Root format function

/**
 * This is the root format function, it can be used to format a string with multiple entities and their given values.
 * @param rawStringParts An array of string parts to be replaced with values
 * @param stringLikes The array of string-like values to replace the string parts with
 */
const fmt = (
  rawStringParts: TemplateStringsArray | string[],
  ...stringLikes: Stringable[]
): FormattedString => {
  let text = rawStringParts[0];
  let entities: MessageEntity[] = [];

  for (let i = 0; i < stringLikes.length; i++) {
    const stringLike = stringLikes[i];
    if (stringLike instanceof FormattedString) {
      entities.push(
        ...stringLike.entities.map((e) => ({
          ...e,
          offset: e.offset + text.length,
        })),
      );
    }
    text += stringLike.toString();
    text += rawStringParts[i + 1];
  }
  return new FormattedString(text, entities);
};

export {
  bold,
  code,
  fmt,
  FormattedString,
  italic,
  link,
  linkMessage,
  mentionUser,
  pre,
  spoiler,
  strikethrough,
  underline,
};
