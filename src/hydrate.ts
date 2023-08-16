import type { Api, Context, InputTextMessageContent } from "./deps.deno.ts";

import { FormattedString } from "./format.ts";
import { buildTransformer } from "./transformer.ts";

type Head<T extends Array<unknown>> = T extends
  [head: infer E1, ...tail: infer E2] ? E1
  : never;

type Tail<T extends Array<unknown>> = T extends
  [head: infer E1, ...tail: infer E2] ? E2
  : [];

type InputTextMessageContentX =
  & Omit<InputTextMessageContent, "message_text">
  & {
    message_text: string | FormattedString;
  };

/**
 * Context flavor that will hydrate methods to accept FormattedString
 */
type ParseModeFlavor<C extends Context> = Omit<C, "answerInlineQuery"> & {
  answerInlineQuery: (
    results: Parameters<C["answerInlineQuery"]>[0] extends readonly (infer Q)[]
      ? readonly (
        Q extends { type: "article"; input_message_content: infer R1 }
          ? Omit<Q, "input_message_content"> & {
            input_message_content: R1 | InputTextMessageContentX;
          }
          : Q extends { caption?: string; input_message_content?: infer R2 }
            ? Omit<Q, "caption" | "input_message_content"> & {
              caption?: string | FormattedString;
              input_message_content?: R2 | InputTextMessageContentX;
            }
          : Q extends { input_message_content?: infer R3 }
            ? Omit<Q, "input_message_content"> & {
              input_message_content?: R3 | InputTextMessageContentX;
            }
          : Q
      )[]
      : never,
    ...args: Tail<Parameters<C["answerInlineQuery"]>>
  ) => ReturnType<C["answerInlineQuery"]>;
  copyMessage: (
    chat_id: Head<Parameters<C["copyMessage"]>>,
    other?: Head<Tail<Parameters<C["copyMessage"]>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Parameters<C["copyMessage"]>>>
  ) => ReturnType<C["copyMessage"]>;
  editMessageCaption: (
    other?: Head<Parameters<C["editMessageCaption"]>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Parameters<C["editMessageText"]>>
  ) => ReturnType<C["editMessageCaption"]>;
  editMessageMedia: (
    media: Head<Parameters<C["editMessageMedia"]>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Parameters<C["editMessageMedia"]>>
  ) => ReturnType<C["editMessageMedia"]>;
  editMessageText: (
    text: FormattedString,
    ...args: Tail<Parameters<C["editMessageText"]>>
  ) => ReturnType<C["editMessageText"]>;
  reply: (
    text: FormattedString,
    ...args: Tail<Parameters<C["reply"]>>
  ) => ReturnType<C["reply"]>;
  replyWithAnimation: (
    animation: Head<Parameters<C["replyWithAnimation"]>>,
    other?: Head<Tail<Parameters<C["replyWithAnimation"]>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Parameters<C["replyWithAnimation"]>>>
  ) => ReturnType<C["replyWithAnimation"]>;
  replyWithAudio: (
    audio: Head<Parameters<C["replyWithAudio"]>>,
    other?: Head<Tail<Parameters<C["replyWithAudio"]>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Parameters<C["replyWithAudio"]>>>
  ) => ReturnType<C["replyWithAudio"]>;
  replyWithDocument: (
    document: Head<Parameters<C["replyWithDocument"]>>,
    other?: Head<Tail<Parameters<C["replyWithDocument"]>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Parameters<C["replyWithDocument"]>>>
  ) => ReturnType<C["replyWithDocument"]>;
  replyWithPhoto: (
    photo: Head<Parameters<C["replyWithPhoto"]>>,
    other?: Head<Tail<Parameters<C["replyWithPhoto"]>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Parameters<C["replyWithPhoto"]>>>
  ) => ReturnType<C["replyWithPhoto"]>;
  replyWithPoll: (
    question: Head<Parameters<C["replyWithPoll"]>>,
    options: Head<Tail<Parameters<C["replyWithPoll"]>>>,
    other?: Head<Tail<Tail<Parameters<C["replyWithPoll"]>>>> & {
      explanation?: FormattedString;
    },
    ...args: Tail<Tail<Tail<Parameters<C["replyWithPoll"]>>>>
  ) => ReturnType<C["replyWithPoll"]>;
  replyWithVideo: (
    photo: Head<Parameters<C["replyWithVideo"]>>,
    other?: Head<Tail<Parameters<C["replyWithVideo"]>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Parameters<C["replyWithVideo"]>>>
  ) => ReturnType<C["replyWithVideo"]>;
  replyWithVoice: (
    photo: Head<Parameters<C["replyWithVoice"]>>,
    other?: Head<Tail<Parameters<C["replyWithVoice"]>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Parameters<C["replyWithVoice"]>>>
  ) => ReturnType<C["replyWithVoice"]>;
};

/**
 * Api flavor that will hydrate methods to accept FormattedString
 */
type ParseModeApiFlavor<A extends Api> = Omit<A, "answerInlineQuery"> & {
  answerInlineQuery: (
    inline_query_id: Head<Parameters<A["answerInlineQuery"]>>,
    results: Tail<Parameters<A["answerInlineQuery"]>>[0] extends
      readonly (infer Q)[] ? readonly (
        Q extends { type: "article"; input_message_content: infer R1 }
          ? Omit<Q, "input_message_content"> & {
            input_message_content: R1 | InputTextMessageContentX;
          }
          : Q extends { caption?: string; input_message_content?: infer R2 }
            ? Omit<Q, "caption" | "input_message_content"> & {
              caption?: string | FormattedString;
              input_message_content?: R2 | InputTextMessageContentX;
            }
          : Q extends { input_message_content?: infer R3 }
            ? Omit<Q, "input_message_content"> & {
              input_message_content?: R3 | InputTextMessageContentX;
            }
          : Q
      )[]
      : never,
    ...args: Tail<Tail<Parameters<A["answerInlineQuery"]>>>
  ) => ReturnType<A["answerInlineQuery"]>;
  copyMessage: (
    chat_id: Head<Parameters<A["copyMessage"]>>,
    from_chat_id: Head<Tail<Parameters<A["copyMessage"]>>>,
    message_id: Head<Tail<Tail<Parameters<A["copyMessage"]>>>>,
    other?: Tail<Tail<Tail<Parameters<A["copyMessage"]>>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Tail<Tail<Parameters<A["copyMessage"]>>>>>
  ) => ReturnType<A["copyMessage"]>;
  editMessageCaption: (
    chat_id: Head<Parameters<A["editMessageCaption"]>>,
    message_id: Head<Tail<Parameters<A["editMessageCaption"]>>>,
    other?: Head<Tail<Tail<Parameters<A["editMessageCaption"]>>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Tail<Parameters<A["editMessageCaption"]>>>>
  ) => ReturnType<A["editMessageCaption"]>;
  editMessageCaptionInline: (
    inline_message_id: Head<Parameters<A["editMessageCaptionInline"]>>,
    other?: Head<Tail<Parameters<A["editMessageCaptionInline"]>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Parameters<A["editMessageCaptionInline"]>>>
  ) => ReturnType<A["editMessageCaptionInline"]>;
  editMessageMedia: (
    chat_id: Head<Parameters<A["editMessageMedia"]>>,
    message_id: Head<Tail<Parameters<A["editMessageMedia"]>>>,
    media: Head<Tail<Tail<Parameters<A["editMessageMedia"]>>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Tail<Parameters<A["editMessageMedia"]>>>>
  ) => ReturnType<A["editMessageMedia"]>;
  editMessageText: (
    chat_id: Head<Parameters<A["editMessageText"]>>,
    message_id: Head<Tail<Parameters<A["editMessageText"]>>>,
    text: FormattedString,
    ...args: Tail<Tail<Tail<Parameters<A["editMessageText"]>>>>
  ) => ReturnType<A["editMessageText"]>;
  sendMessage: (
    chat_id: Head<Parameters<A["sendMessage"]>>,
    text: FormattedString,
    ...args: Tail<Tail<Parameters<A["sendMessage"]>>>
  ) => ReturnType<A["sendMessage"]>;
  sendAnimation: (
    chat_id: Head<Parameters<A["sendAnimation"]>>,
    animation: Head<Tail<Parameters<A["sendAnimation"]>>>,
    other?: Head<Tail<Tail<Parameters<A["sendAnimation"]>>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Tail<Parameters<A["sendAnimation"]>>>>
  ) => ReturnType<A["sendAnimation"]>;
  sendAudio: (
    chat_id: Head<Parameters<A["sendAudio"]>>,
    audio: Head<Tail<Parameters<A["sendAudio"]>>>,
    other?: Head<Tail<Tail<Parameters<A["sendAudio"]>>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Tail<Parameters<A["sendAudio"]>>>>
  ) => ReturnType<A["sendAudio"]>;
  sendDocument: (
    chat_id: Head<Parameters<A["sendDocument"]>>,
    document: Head<Tail<Parameters<A["sendDocument"]>>>,
    other?: Head<Tail<Tail<Parameters<A["sendDocument"]>>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Tail<Parameters<A["sendDocument"]>>>>
  ) => ReturnType<A["sendDocument"]>;
  sendPhoto: (
    chat_id: Head<Parameters<A["sendPhoto"]>>,
    photo: Head<Tail<Parameters<A["sendPhoto"]>>>,
    other?: Head<Tail<Tail<Parameters<A["sendPhoto"]>>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Tail<Parameters<A["sendPhoto"]>>>>
  ) => ReturnType<A["sendPhoto"]>;
  sendPoll: (
    chat_id: Head<Parameters<A["sendPoll"]>>,
    question: Head<Tail<Parameters<A["sendPoll"]>>>,
    options: Head<Tail<Tail<Parameters<A["sendPoll"]>>>>,
    other?: Head<Tail<Tail<Tail<Parameters<A["sendPoll"]>>>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Tail<Tail<Parameters<A["sendPoll"]>>>>>
  ) => ReturnType<A["sendPoll"]>;
  sendVideo: (
    chat_id: Head<Parameters<A["sendVideo"]>>,
    video: Head<Tail<Parameters<A["sendVideo"]>>>,
    other?: Head<Tail<Tail<Parameters<A["sendVideo"]>>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Tail<Parameters<A["sendVideo"]>>>>
  ) => ReturnType<A["sendVideo"]>;
  sendVoice: (
    chat_id: Head<Parameters<A["sendVoice"]>>,
    voice: Head<Tail<Parameters<A["sendVoice"]>>>,
    other?: Head<Tail<Tail<Parameters<A["sendVoice"]>>>> & {
      caption?: FormattedString;
    },
    ...args: Tail<Tail<Tail<Parameters<A["sendVoice"]>>>>
  ) => ReturnType<A["sendVoice"]>;
};

export {
  buildTransformer as hydrateFmt,
  type ParseModeApiFlavor,
  type ParseModeFlavor,
};
