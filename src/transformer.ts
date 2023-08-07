import type { Transformer } from "./deps.deno.ts";

import { FormattedString } from "./format.ts";
import {
  isCaptionEntitiesPayload,
  isCaptionEntitiesResult,
  isExplanationEntitiesPayload,
  isMediaEntitiesPayload,
  isMessageTextEntitiesContent,
  isTextEntitiesPayload,
} from "./utils.ts";

/**
 * Creates a new transformer that extracts entities from FormattedString text element.
 * @see Usage https://grammy.dev/plugins/parse-mode#usage-improving-formatting-experience
 * @returns {Transformer} The transformer.
 */
const buildTransformer = () => {
  const transformer: Transformer = (prev, method, payload, signal) => {
    if (!payload || "parse_mode" in payload) {
      return prev(method, payload, signal);
    }

    if (
      isCaptionEntitiesPayload(method, payload) &&
      payload.caption instanceof FormattedString
    ) {
      const caption = payload.caption;
      const entities = payload.caption_entities;
      payload.caption = caption.toString();
      payload.caption_entities = [
        ...(entities ? entities : []),
        ...caption.entities,
      ];
    } else if (
      isExplanationEntitiesPayload(method, payload) &&
      payload.explanation instanceof FormattedString
    ) {
      const explanation = payload.explanation;
      const entities = payload.explanation_entities;
      payload.explanation = explanation.toString();
      payload.explanation_entities = [
        ...(entities ? entities : []),
        ...explanation.entities,
      ];
    } else if (isMediaEntitiesPayload(method, payload)) {
      const iterableMedia = payload.media instanceof Array
        ? payload.media
        : [payload.media];
      for (const media of iterableMedia) {
        if (media.caption instanceof FormattedString) {
          const caption = media.caption;
          const entities = media.caption_entities;
          media.caption = caption.toString();
          media.caption_entities = [
            ...(entities ? entities : []),
            ...caption.entities,
          ];
        }
      }
    } else if (
      isTextEntitiesPayload(method, payload) &&
      payload.text instanceof FormattedString
    ) {
      const text = payload.text;
      const entities = payload.entities;
      payload.text = text.toString();
      payload.entities = [...(entities ? entities : []), ...text.entities];
    } else if ("results" in payload && payload.results instanceof Array) {
      for (const result of payload.results) {
        if (
          isCaptionEntitiesResult(result) &&
          result.caption instanceof FormattedString
        ) {
          const caption = result.caption;
          const entities = result.caption_entities;
          result.caption = caption.toString();
          result.caption_entities = [
            ...(entities ? entities : []),
            ...caption.entities,
          ];
        }

        if ("input_message_content" in result && result.input_message_content) {
          const content = result.input_message_content;
          if (
            isMessageTextEntitiesContent(content) &&
            content.message_text instanceof FormattedString
          ) {
            const text = content.message_text;
            const entities = content.entities;
            content.message_text = text.toString();
            content.entities = [
              ...(entities ? entities : []),
              ...text.entities,
            ];
          }
        }
      }
    }
    return prev(method, payload, signal);
  };
  return transformer;
};

export { buildTransformer };
