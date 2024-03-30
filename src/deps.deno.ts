import type {
  Context,
  NextFunction,
  Transformer,
} from "https://lib.deno.dev/x/grammy@^1.20/mod.ts";

import type {
  InputMediaPhoto,
  InputMediaVideo,
  InputMediaAnimation,
  InputMediaAudio,
  InputMediaDocument,
} from "https://lib.deno.dev/x/grammy@^1.20/types.ts";

export type {
  Context,
  NextFunction,
  Transformer,
  InputMediaPhoto,
  InputMediaVideo,
  InputMediaAnimation,
  InputMediaAudio,
  InputMediaDocument,
}

export type MessageEntity = NonNullable<NonNullable<Parameters<Context["reply"]>[1]>["entities"]>[number];
export type ParseMode = NonNullable<NonNullable<Parameters<Context["reply"]>[1]>["parse_mode"]>;