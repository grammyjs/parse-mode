import type { MessageEntity } from "./deps.deno.ts";

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
 * Represents the formatted string after the parsing.
 */
class FormattedString implements Stringable {
  /**
   * Plain text value for this `FormattedString`
   */
  text: string;

  /**
   * Format entities for this `FormattedString`
   */
  entities: MessageEntity[];

  /**
   * Creates a new `FormattedString`. Useful for constructing a
   * `FormattedString` from user's formatted message
   *
   * ```ts
   * // Constructing a new `FormattedString` from user's message
   * const userMsg = new FormattedString(ctx.message.text, ctx.entities());
   * ```
   *
   * @param text Plain text value
   * @param entities Format entities
   */
  constructor(text: string, entities: MessageEntity[]) {
    this.text = text;
    this.entities = entities;
  }

  /**
   * Returns the string representation of this object
   */
  toString() {
    return this.text;
  }
}

const unwrap = (stringLike: Stringable): FormattedString => {
  if (stringLike instanceof FormattedString) {
    return stringLike;
  }
  return new FormattedString(stringLike.toString(), []);
};

const buildFormatter = <T extends Array<unknown> = never>(
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

// === Native entity functions
/**
 * Formats the `Stringable` as bold. Incompatible with `code` and `pre`.
 * @param stringLike The `Stringable` to format.
 */
const bold = buildFormatter("bold");
/**
 * Formats the `Stringable` as inline code. Cannot be combined with any other formats.
 * @param stringLike The `Stringable` to format.
 */
const code = buildFormatter("code");
/**
 * Formats the `Stringable` as italic. Incompatible with `code` and `pre`.
 * @param stringLike The `Stringable` to format.
 */
const italic = buildFormatter("italic");
/**
 * Formats the `Stringable` as a link. Incompatible with `code` and `pre`.
 * @param stringLike The `Stringable` to format.
 * @param url The URL to link to.
 */
const link = buildFormatter<[url: string]>("text_link", "url");
/**
 * Formats the `Stringable` as a code block. Cannot be combined with any other formats.
 * @param stringLike The `Stringable` to format.
 * @param language The language of the code block.
 */
const pre = buildFormatter<[language: string]>("pre", "language");
/**
 * Formats the `Stringable` as a spoiler. Incompatible with `code` and `pre`.
 * @param stringLike The `Stringable` to format.
 */
const spoiler = buildFormatter("spoiler");
/**
 * Formats the `Stringable` as a blockquote. Cannot be nested.
 * @param stringLike The `Stringable` to format.
 */
const blockquote = buildFormatter("blockquote");
/**
 * Formats the `Stringable` as a strikethrough. Incompatible with `code` and `pre`.
 * @param stringLike The `Stringable` to format.
 */
const strikethrough = buildFormatter("strikethrough");
/**
 * Formats the `Stringable` as a underline. Incompatible with `code` and `pre`.
 * @param stringLike The `Stringable` to format.
 */
const underline = buildFormatter("underline");

// Utility functions

/**
 * Formats the `Stringable` as an internal Telegram link to a user. Incompatible with `code` and `pre`.
 * @param stringLike The `Stringable` to format.
 * @param userId The user ID to link to.
 */
const mentionUser = (stringLike: Stringable, userId: number) => {
  return link(stringLike, `tg://user?id=${userId}`);
};

/**
 * Inserts a custom emoji.
 * @param placeholder A placeholder emoji
 * @param emoji The custom emoji identifier
 */
const customEmoji = (placeholder: Stringable, emoji: number) => {
  return link(placeholder, `tg://emoji?id=${emoji}`);
};

/**
 * Formats the `Stringable`` as a Telegram link to a chat message. Incompatible with `code` and `pre`.
 * @param stringLike The `Stringable` to format.
 * @param chatId The chat ID to link to.
 * @param messageId The message ID to link to.
 */
const linkMessage = (
  stringLike: Stringable,
  chatId: number,
  messageId: number,
) => {
  if (chatId > 0) {
    console.warn(
      "linkMessage can only be used for supergroups and channel messages. Refusing to transform into link.",
    );
    return stringLike;
  } else if (chatId < -1002147483647 || chatId > -1000000000000) {
    console.warn(
      "linkMessage is not able to link messages whose chatIds are greater than -1000000000000 or less than -1002147483647 at this moment. Refusing to transform into link.",
    );
    return stringLike;
  } else {
    return link(
      stringLike,
      `https://t.me/c/${(chatId + 1000000000000) * -1}/${messageId}`,
    );
  }
};

// ===  Format tagged template function

/**
 * This is the format tagged template function. It accepts a template literal
 * containing any mix of `Stringable` and `string` values, and constructs a
 * `FormattedString` that represents the combination of all the given values.
 * The constructed `FormattedString` also implements Stringable, and can be used
 * in further `fmt` tagged templates.
 *
 * Can also be called like regular function and passed an array of `Stringable`s.
 *
 * ```ts
 * // Using return values of fmt in fmt
 * const left = fmt`${bold('>>>')} >>>`;
 * const right = fmt`<<< ${bold('<<<')}`;
 *
 * const final = fmt`${left} ${ctx.msg.text} ${right}`;
 * await ctx.replyFmt(final);
 *
 * // Using regular function form
 * const cart = fmt([
 *   "Your shopping cart:\n",
 *   ...items.map((item) => fmt`- ${bold(item.name)} (${item.price})\n`),
 * ]);
 * // Using result in editMessageText
 * await ctx.editMessageText(cart.text, { entities: cart.entities });
 * ```
 *
 * @param rawStringParts An array of `string` parts found in the tagged template (can also be `Stringable`s)
 * @param stringLikes An array of `Stringable`s found in the tagged template
 */
const fmt = (
  rawStringParts: TemplateStringsArray | Stringable[],
  ...stringLikes: Stringable[]
): FormattedString => {
  let text = "";
  const entities: MessageEntity[] = [];

  const length = Math.max(rawStringParts.length, stringLikes.length);
  for (let i = 0; i < length; i++) {
    for (const stringLike of [rawStringParts[i], stringLikes[i]]) {
      if (stringLike instanceof FormattedString) {
        entities.push(
          ...stringLike.entities.map((e) => ({
            ...e,
            offset: e.offset + text.length,
          })),
        );
      }
      if (stringLike != null) text += stringLike.toString();
    }
  }
  return new FormattedString(text, entities);
};

export {
  blockquote,
  bold,
  code,
  customEmoji,
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
