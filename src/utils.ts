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

function isCaptionEntitiesPayload(
  method: string,
  _payload: unknown,
): _payload is CaptionEntitiesPayload {
  return captionEntitiesMethod.has(method);
}

function isMediaEntitiesPayload(
  method: string,
  _payload: unknown,
): _payload is MediaEntitiesPayload {
  return mediaEntitiesMethod.has(method);
}

function isTextEntitiesPayload(
  method: string,
  _payload: unknown,
): _payload is TextEntitiesPayload {
  return textEntitiesMethod.has(method);
}

export {
  isCaptionEntitiesPayload,
  isMediaEntitiesPayload,
  isTextEntitiesPayload,
};
