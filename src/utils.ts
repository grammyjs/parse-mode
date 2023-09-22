import type { MessageEntity } from "./deps.deno.ts";

import { FormattedString } from "./format.ts";

interface CaptionEntities {
  caption?: FormattedString | string;
  caption_entities?: MessageEntity[];
}

interface ExplanationEntities {
  explanation?: FormattedString | string;
  explanation_entities?: MessageEntity[];
}

interface MediaEntities {
  media: CaptionEntities | CaptionEntities[];
}

interface MessageTextEntities {
  message_text: FormattedString | string;
  entities?: MessageEntity[];
}

interface TextEntities {
  text: FormattedString | string;
  entities?: MessageEntity[];
}

const captionEntitiesMethod = new Set([
  "copyMessage",
  "editMessageCaption",
  "sendAnimation",
  "sendAudio",
  "sendDocument",
  "sendPhoto",
  "sendVideo",
  "sendVoice",
]);

const explanationEntitiesMethod = new Set([
  "sendPoll",
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
): _payload is CaptionEntities {
  return captionEntitiesMethod.has(method);
}

function isExplanationEntitiesPayload(
  method: string,
  _payload: unknown,
): _payload is ExplanationEntities {
  return explanationEntitiesMethod.has(method);
}

function isMediaEntitiesPayload(
  method: string,
  _payload: unknown,
): _payload is MediaEntities {
  return mediaEntitiesMethod.has(method);
}

function isTextEntitiesPayload(
  method: string,
  _payload: unknown,
): _payload is TextEntities {
  return textEntitiesMethod.has(method);
}

function isCaptionEntitiesResult(
  result: {},
): result is CaptionEntities {
  return result instanceof Object && "caption" in result;
}

function isMessageTextEntitiesContent(
  content: {},
): content is MessageTextEntities {
  return content instanceof Object && "message_text" in content;
}

export {
  isCaptionEntitiesPayload,
  isCaptionEntitiesResult,
  isExplanationEntitiesPayload,
  isMediaEntitiesPayload,
  isMessageTextEntitiesContent,
  isTextEntitiesPayload,
};
