import type { Context, NextFunction, Transformer } from "grammy";
import type {
  InputMedia,
  InputMediaAudio,
  InputMediaDocument,
  InputMediaPhoto,
  InputMediaVideo,
} from "grammy/types";

export type { Context, NextFunction, Transformer };

export type {
  InputMedia,
  InputMediaAudio,
  InputMediaDocument,
  InputMediaPhoto,
  InputMediaVideo,
};

export type MessageEntity = NonNullable<
  NonNullable<Parameters<Context["reply"]>[1]>["entities"]
>[number];
export type ParseMode = NonNullable<
  NonNullable<Parameters<Context["reply"]>[1]>["parse_mode"]
>;
