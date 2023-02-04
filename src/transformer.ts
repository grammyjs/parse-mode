import type { ParseMode, Transformer } from "./deps.deno.ts";

/**
 * Creates a new transformer for the given parse mode.
 * @param parseMode {ParseMode} The parse mode to use.
 * @see https://core.telegram.org/bots/api#formatting-options for more information about formatting.
 * @returns {Transformer} The transformer.
 */
const buildTransformer = (parseMode: ParseMode): Transformer => (
  (prev, method, payload, signal) => {
    if (!payload || "parse_mode" in payload) {
      return prev(method, payload, signal);
    }

    switch (method) {
      case "editMessageMedia":
        if (
          "media" in payload &&
          !("parse_mode" in payload.media)
        ) {
          payload.media.parse_mode = parseMode;
        }
        break;

      case "answerInlineQuery":
        if ("results" in payload) {
          for (const result of payload.results) {
            if (
              "input_message_content" in result &&
              !("parse_mode" in result.input_message_content)
            ) {
              result.input_message_content.parse_mode = parseMode;
            } else if (!("parse_mode" in result)) {
              result.parse_mode = parseMode;
            }
          }
        }
        break;

      default:
        payload = { ...payload, ...{ parse_mode: parseMode } };
    }

    return prev(
      method,
      payload,
      signal,
    );
  }
);

export { buildTransformer as parseMode };
