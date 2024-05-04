import type { Context, NextFunction, Transformer } from "grammy";
import type {
    InputMediaPhoto,
    InputMediaVideo,
    InputMediaAnimation,
    InputMediaAudio,
    InputMediaDocument,
  } from "grammy/types";

export type {
    Context,
    NextFunction,
    Transformer,
  };

export type {
    InputMediaPhoto,
    InputMediaVideo,
    InputMediaAnimation,
    InputMediaAudio,
    InputMediaDocument,
  };
  
  export type MessageEntity = NonNullable<NonNullable<Parameters<Context["reply"]>[1]>["entities"]>[number];
  export type ParseMode = NonNullable<NonNullable<Parameters<Context["reply"]>[1]>["parse_mode"]>;