import type { MessageEntity } from "./deps.deno.ts";

import { FormattedString } from "./format.ts";

interface CaptionEntitiesPayload {
  caption: FormattedString | string | undefined;
  caption_entities: MessageEntity[];
}

interface MediaEntitiesPayload {
  media: CaptionEntitiesPayload | CaptionEntitiesPayload[];
}

interface TextEntitiesPayload {
  text: FormattedString | string | undefined;
  entities: MessageEntity[];
}

const captionEntitiesMethod = new Set([
  "editMessageCaption",
  "sendAnimation",
  "sendAudio",
  "sendDocument",
  "sendPhoto",
  "sendVideo",
  "sendVoice",
]);

const mediaEntitiesMethod = new Set([
  "editMessageMedia",
  "sendMediaGroup",
]);

const textEntitiesMethod = new Set([
  "editMessageText",
  "sendMessage",
]);

// deno-lint-ignore no-explicit-any
function isCaptionEntitiesPayload(
  method: any,
  _payload: any,
): _payload is CaptionEntitiesPayload {
  return captionEntitiesMethod.has(method);
}

// deno-lint-ignore no-explicit-any
function isMediaEntitiesPayload(
  method: any,
  _payload: any,
): _payload is MediaEntitiesPayload {
  return mediaEntitiesMethod.has(method);
}

// deno-lint-ignore no-explicit-any
function isTextEntitiesPayload(
  method: any,
  _payload: any,
): _payload is TextEntitiesPayload {
  return textEntitiesMethod.has(method);
}

export {
  isCaptionEntitiesPayload,
  isMediaEntitiesPayload,
  isTextEntitiesPayload,
};
