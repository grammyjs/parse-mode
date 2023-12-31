import type {
  Context,
  NextFunction,
  Transformer,
} from "https://lib.deno.dev/x/grammy@^1.20/mod.ts";

export type {
  Context,
  NextFunction,
  Transformer,
};

export type MessageEntity = NonNullable<NonNullable<Parameters<Context["reply"]>[1]>["entities"]>[number];
export type ParseMode = NonNullable<NonNullable<Parameters<Context["reply"]>[1]>["parse_mode"]>;