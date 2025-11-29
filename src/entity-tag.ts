import type { MessageEntity } from "./deps.deno.ts";

/**
 * Represents an entity tag used for formatting text via fmt.
 */
export type EntityTag = Omit<MessageEntity, "offset" | "length">;

function buildFormatter<T extends Array<unknown> = never>(
  type: MessageEntity["type"],
  ...formatArgKeys: T
): (...formatArgs: T) => EntityTag {
  return (...formatArgs) => {
    if (type === "pre") {
      console.log(formatArgs);
    }
    const formatArgObj = Object.fromEntries(
      formatArgKeys.map((formatArgKey, i) => [formatArgKey, formatArgs[i]]),
    );
    return { type, ...formatArgObj };
  };
}

// === Native entity tag functions
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
export function pre(language?: string) {
  return buildFormatter<[language: string | undefined]>("pre", "language")(
    language,
  );
}

/**
 * `spoiler` entity tag. Incompatible with `code` and `pre`.
 */
export function spoiler() {
  return buildFormatter("spoiler")();
}

/**
 * `custom_emoji` entity tag. Incompatible with `code` and `pre`.
 * @param customEmojiId The custom emoji ID.
 */
export function emoji(customEmojiId: string) {
  return buildFormatter<[customEmojiId: string]>(
    "custom_emoji",
    "custom_emoji_id",
  )(customEmojiId);
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
