import type { MessageEntity } from "./deps.deno.ts";

/**
 * Objects that implement this interface 
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
 * Objects that implement this interface implement a `.text`
 * property that returns a `string` value of itself, and a
 * `.entities` property that returns a `MessageEntity[]` value
 * of itself
 */
export interface FormattedString {
  /**
   * Plain text value for this `FormattedString`
   */
  text: string;

  /**
   * Format entities for this `FormattedString`
   */
  entities: MessageEntity[];
}

/**
 * Represents the formatted string after the parsing.
 */
export class Fmt implements Stringable, FormattedString {
  /**
   * Plain text value for this `Fmt` object
   */
  text: string;

  /**
   * Format entities for this `Fmt` object
   */
  entities: MessageEntity[];

  /**
   * Creates a new `Fmt`. Useful for constructing a
   * `FormattedString` from user's formatted message
   *
   * ```ts
   * // Constructing a new `Fmt` from user's message
   * const userMsg = new Fmt(ctx.message.text, ctx.entities());
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
   * Returns the string representation of this `Fmt` object
   */
  toString() {
    return this.text;
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
};

// === Native entity functions
/**
 * Alias for `bold`` entity tag. Incompatible with `code` and `pre`.
 */
export function b() {
  return buildFormatter("bold")();
}
/**
 * `bold`` entity tag. Incompatible with `code` and `pre`.
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

function isFormattedString(value: unknown): value is FormattedString {
  return typeof value === "object"
    && value !== null
    && "text" in value
    && "entities" in value
    && Array.isArray(value.entities);
}

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
 * @param rawStringParts An array of `string` parts found in the tagged template
 * @param entityTagsOrFormattedStrings An array of `EntityTag`s, 
 * `FormattedString`s, or nullary functions returning `EntityTag`s found in the tagged template
 */
export function fmt(
  rawStringParts: TemplateStringsArray,
  ...entityTagsOrFormattedStrings: (Stringable | EntityTag | (() => EntityTag))[]
): FormattedString {
  let text = "";
  const entities: MessageEntity[] = [];
  const openEntitiesStack: (EntityTag & { offset: number })[] = [];

  for (let i = 0; i < rawStringParts.length; i++) {
    text += rawStringParts[i];
    if (i === rawStringParts.length - 1) {
      break;
    }

    const entityTagOrFormattedString = entityTagsOrFormattedStrings[i];
    if (isFormattedString(entityTagOrFormattedString)) {
      entities.push(
        ...entityTagOrFormattedString.entities.map(e => ({
          ...e,
          offset: e.offset + text.length,
        }))
      )
      text += entityTagOrFormattedString.text;
      continue;
    }

    let entityTag: EntityTag | undefined;
    if (typeof entityTagOrFormattedString === "object" && "type" in entityTagOrFormattedString) {
      entityTag = entityTagOrFormattedString;
    }
    if (typeof entityTagOrFormattedString === "function") {
      entityTag = entityTagOrFormattedString();
    }
    if (entityTag) {
      const lastOpenedEntityTag = openEntitiesStack.pop();
      if (!lastOpenedEntityTag || lastOpenedEntityTag.type !== entityTag.type) {
        openEntitiesStack.push(...[lastOpenedEntityTag, { ...entityTag, offset: text.length }].filter(e => !!e));
      } else {
        entities.push({ ...lastOpenedEntityTag, length: text.length - lastOpenedEntityTag.offset } as MessageEntity);
      }
      continue;
    }

    text += entityTagOrFormattedString.toString();
  }
  entities.push(...openEntitiesStack.map(e => ({ ...e, length: text.length - e.offset }) as MessageEntity));

  return new Fmt(text, entities);
};

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
};

/**
 * Formats the `Stringable`` as a Telegram link to a chat message. Incompatible with `code` and `pre`.
 * @param stringLike The `Stringable` to format.
 * @param chatId The chat ID to link to.
 * @param messageId The message ID to link to.
 */
export function linkMessage(stringLike: Stringable, chatId: number, messageId: number) {
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
    return fmt`${a(`https://t.me/c/${(chatId + 1000000000000) * -1}/${messageId}`)}${stringLike}${a}`;
  }
}
