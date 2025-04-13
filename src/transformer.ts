import type { Transformer } from "./deps.deno.ts";

const wellKnownParseModesMap = new Map([
  ["html", "HTML"],
  ["markdown", "Markdown"],
  ["markdownv2", "MarkdownV2"],
]);

/**
 * Creates a new transformer for the given parse mode.
 * @param parseMode {string} The parse mode to use. If the parse mode is not in the well known parse modes map, it will be used as is.
 * @see https://core.telegram.org/bots/api#formatting-options for well known parse modes.
 * @returns {Transformer} The transformer.
 */
const buildTransformer = (parseMode: string) => {
  const normalisedParseMode =
    wellKnownParseModesMap.get(parseMode.toLowerCase()) ?? parseMode;
  if (!wellKnownParseModesMap.has(parseMode.toLowerCase())) {
    console.warn(
      `Could not find parse_mode: ${parseMode}. If this is a valid parse_mode, you should ignore this message.`,
    );
  }

  const transformer: Transformer = (prev, method, payload, signal) => {
    if (!payload || "parse_mode" in payload) {
      return prev(method, payload, signal);
    }

    switch (method) {
      case "sendMediaGroup":
      case "editMessageMedia":
        if (
          "media" in payload &&
          !("parse_mode" in payload.media)
        ) {
          // @ts-ignore
          payload.media.parse_mode = normalisedParseMode;
        }
        break;

      case "answerInlineQuery":
        if ("results" in payload) {
          for (const result of payload.results) {
            if (
              "input_message_content" in result &&
              // @ts-ignore
              !("parse_mode" in result.input_message_content)
            ) {
              // @ts-ignore
              result.input_message_content.parse_mode = normalisedParseMode;
            } else if (!("parse_mode" in result)) {
              // @ts-ignore
              result.parse_mode = normalisedParseMode;
            }
          }
        }
        break;

      default:
        payload = { ...payload, ...{ parse_mode: normalisedParseMode } };
    }

    return prev(
      method,
      payload,
      signal,
    );
  };
  return transformer;
};

export { buildTransformer as parseMode };
