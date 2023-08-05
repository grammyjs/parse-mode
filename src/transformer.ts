import type { Transformer } from "./deps.deno.ts";

import { FormattedString } from "./format.ts";
import {
  isCaptionEntitiesPayload,
  isMediaEntitiesPayload,
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
    }
    return prev(method, payload, signal);
  };
  return transformer;
};

export { buildTransformer as parseMode };
